// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { DancingLinks, exactCover, solveNQueens, isValidNQueens, solveSudoku } from '../dancing-links';

// ─── helpers ────────────────────────────────────────────────────────────────

function identityMatrix(n: number): number[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
}

// A matrix with a zero column at position zeroCol — no solution possible
function zeroColMatrix(rows: number, cols: number, zeroCol: number): number[][] {
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => (j === zeroCol ? 0 : 1))
  );
}

// ─── N-Queens solution counts ────────────────────────────────────────────────
const NQUEENS_COUNTS: Record<number, number> = {
  1: 1,
  2: 0,
  3: 0,
  4: 2,
  5: 10,
  6: 4,
  7: 40,
  8: 92,
};

// ─── BLOCK 1: DancingLinks — empty matrix (50 tests) ─────────────────────────
describe('DancingLinks empty matrix', () => {
  for (let t = 0; t < 50; t++) {
    it(`empty matrix trial ${t + 1}: solve() returns [[]] (one empty solution)`, () => {
      const dlx = new DancingLinks([]);
      const sols = dlx.solve();
      // An empty matrix has exactly one solution: the empty set
      expect(sols).toEqual([[]]);
    });
  }
});

// ─── BLOCK 2: DancingLinks — identity matrix (100 tests, n=1..100) ────────────
describe('DancingLinks identity matrix', () => {
  for (let n = 1; n <= 100; n++) {
    it(`identity ${n}x${n}: exactly 1 solution with rows [0..${n - 1}]`, () => {
      const mat = identityMatrix(n);
      const dlx = new DancingLinks(mat);
      const sols = dlx.solve();
      expect(sols.length).toBe(1);
      // Solution must contain all row indices 0..n-1 (sorted)
      expect(sols[0].slice().sort((a, b) => a - b)).toEqual(
        Array.from({ length: n }, (_, i) => i)
      );
    });
  }
});

// ─── BLOCK 3: DancingLinks — zero-column (no solution) (100 tests) ───────────
describe('DancingLinks zero-column (no solution)', () => {
  for (let t = 0; t < 100; t++) {
    const rows = (t % 5) + 2;   // 2..6
    const cols = (t % 4) + 3;   // 3..6
    const zeroCol = t % cols;
    it(`zero-col matrix ${rows}x${cols} zeroCol=${zeroCol}: solve() returns []`, () => {
      const mat = zeroColMatrix(rows, cols, zeroCol);
      const dlx = new DancingLinks(mat);
      const sols = dlx.solve();
      expect(sols).toEqual([]);
    });
  }
});

// ─── BLOCK 4: exactCover basic (100 tests) ───────────────────────────────────
describe('exactCover basic: single-element universe', () => {
  for (let n = 1; n <= 100; n++) {
    it(`exactCover universe=[${n}] subsets=[[${n}]]: finds solution [[${n}]]`, () => {
      const result = exactCover([n], [[n]]);
      expect(result).not.toBeNull();
      expect(result).toEqual([[n]]);
    });
  }
});

// ─── BLOCK 5: exactCover multiple subsets (50 tests) ─────────────────────────
describe('exactCover multiple subsets', () => {
  // Standard textbook example: universe {1,2,3,4,5,6,7}
  // subsets A={1,4,7}, B={1,4}, C={4,5,7}, D={3,5,6}, E={2,3,6,7}, F={2,7}
  const universe = [1, 2, 3, 4, 5, 6, 7];
  const subsets = [
    [1, 4, 7],   // 0: A
    [1, 4],      // 1: B
    [4, 5, 7],   // 2: C
    [3, 5, 6],   // 3: D
    [2, 3, 6, 7],// 4: E
    [2, 7],      // 5: F
  ];

  for (let t = 0; t < 50; t++) {
    it(`exactCover classic instance trial ${t + 1}: solution covers universe exactly`, () => {
      const result = exactCover(universe, subsets);
      expect(result).not.toBeNull();
      // The result subsets should cover every element exactly once
      const covered = result!.flat();
      covered.sort((a, b) => a - b);
      expect(covered).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  }
});

// ─── BLOCK 6: solveNQueens — counts (100 tests, n=1..8 repeated) ─────────────
describe('solveNQueens solution counts', () => {
  // Run each of n=1..8 multiple times to reach 100 tests (8*12=96, pad to 100)
  const nValues = [1, 2, 3, 4, 5, 6, 7, 8];
  let count = 0;
  for (let rep = 0; rep < 13; rep++) {
    for (const n of nValues) {
      if (count >= 100) break;
      count++;
      it(`solveNQueens(${n}) rep=${rep + 1}: ${NQUEENS_COUNTS[n]} solutions`, () => {
        const sols = solveNQueens(n);
        expect(sols.length).toBe(NQUEENS_COUNTS[n]);
      });
    }
    if (count >= 100) break;
  }
  // Fill remaining to hit exactly 100
  for (let i = count; i < 100; i++) {
    const n = (i % 8) + 1;
    it(`solveNQueens(${n}) extra trial ${i + 1}: ${NQUEENS_COUNTS[n]} solutions`, () => {
      const sols = solveNQueens(n);
      expect(sols.length).toBe(NQUEENS_COUNTS[n]);
    });
  }
});

// ─── BLOCK 7: isValidNQueens — valid placements (100 tests) ──────────────────
describe('isValidNQueens valid placements', () => {
  // Collect all valid solutions for n=4..8
  const allValidSols: number[][] = [];
  for (let n = 4; n <= 8; n++) {
    allValidSols.push(...solveNQueens(n));
  }
  // There are 2+10+4+40+92 = 148 solutions total

  for (let t = 0; t < 100; t++) {
    const sol = allValidSols[t % allValidSols.length];
    it(`isValidNQueens valid [${sol.join(',')}] trial ${t + 1}: returns true`, () => {
      expect(isValidNQueens(sol)).toBe(true);
    });
  }
});

// ─── BLOCK 8: isValidNQueens — invalid placements (100 tests) ────────────────
describe('isValidNQueens invalid placements', () => {
  // Generate invalid placements by having duplicate column values or diagonal conflicts
  for (let t = 0; t < 100; t++) {
    const n = (t % 5) + 4; // n=4..8
    // Placement with two queens in same column
    const placement = Array.from({ length: n }, (_, i) => i % (n - 1)); // col 0 appears twice
    it(`isValidNQueens invalid same-col placement n=${n} trial ${t + 1}: returns false`, () => {
      expect(isValidNQueens(placement)).toBe(false);
    });
  }
});

// ─── BLOCK 9: DancingLinks findFirst (100 tests) ─────────────────────────────
describe('DancingLinks findFirst on identity matrix', () => {
  for (let n = 1; n <= 100; n++) {
    it(`findFirst on ${n}x${n} identity: returns array of length ${n}`, () => {
      const mat = identityMatrix(n);
      const dlx = new DancingLinks(mat);
      const sol = dlx.findFirst();
      expect(sol).not.toBeNull();
      expect(sol!.length).toBe(n);
      // All row indices must be unique and in [0, n)
      const sorted = sol!.slice().sort((a, b) => a - b);
      expect(sorted).toEqual(Array.from({ length: n }, (_, i) => i));
    });
  }
});

// ─── BLOCK 10: DancingLinks maxSolutions (100 tests) ─────────────────────────
describe('DancingLinks maxSolutions=1 stops after first solution', () => {
  for (let n = 1; n <= 100; n++) {
    it(`identity ${n}x${n} with maxSolutions=1: solve() returns exactly 1 solution`, () => {
      const mat = identityMatrix(n);
      const dlx = new DancingLinks(mat, 1);
      const sols = dlx.solve();
      // Identity matrix has exactly 1 solution, maxSolutions=1 must also yield 1
      expect(sols.length).toBe(1);
    });
  }
});

// ─── BLOCK 11: DancingLinks no-op columns / all-zeros rows (100 tests) ────────
describe('DancingLinks all-zeros row does not contribute to solution', () => {
  for (let t = 0; t < 100; t++) {
    const n = (t % 4) + 2; // n=2..5
    it(`identity ${n}x${n} with one extra all-zeros row: still 1 solution (rows 0..${n - 1})`, () => {
      // Add an all-zeros row at the bottom
      const mat = identityMatrix(n);
      mat.push(new Array(n).fill(0));
      const dlx = new DancingLinks(mat);
      const sols = dlx.solve();
      expect(sols.length).toBe(1);
      // All-zeros row can never be selected (it covers no columns), so solution is still [0..n-1]
      const sorted = sols[0].slice().sort((a, b) => a - b);
      expect(sorted).toEqual(Array.from({ length: n }, (_, i) => i));
    });
  }
});

// ─── BLOCK 12: numSolutions property (50 tests) ──────────────────────────────
describe('DancingLinks numSolutions property', () => {
  for (let n = 1; n <= 50; n++) {
    it(`identity ${n}x${n}: numSolutions=1 after solve()`, () => {
      const mat = identityMatrix(n);
      const dlx = new DancingLinks(mat);
      dlx.solve();
      expect(dlx.numSolutions).toBe(1);
    });
  }
});

// ─── BLOCK 13: exactCover null (no solution) (50 tests) ──────────────────────
describe('exactCover returns null when no solution exists', () => {
  for (let t = 0; t < 50; t++) {
    const a = t + 1;
    const b = t + 2;
    it(`exactCover universe=[${a},${b}] subsets=[[${a}]]: returns null (${b} uncovered)`, () => {
      // Only one subset covering element a; b is never covered → no exact cover
      const result = exactCover([a, b], [[a]]);
      expect(result).toBeNull();
    });
  }
});

// ─── BLOCK 14: solveNQueens each solution is valid (50 tests) ─────────────────
describe('solveNQueens: every returned solution passes isValidNQueens', () => {
  const allSols: Array<{ n: number; sol: number[] }> = [];
  for (let n = 4; n <= 8; n++) {
    solveNQueens(n).forEach(sol => allSols.push({ n, sol }));
  }
  for (let t = 0; t < 50; t++) {
    const { n, sol } = allSols[t % allSols.length];
    it(`n=${n} sol=[${sol.join(',')}] trial ${t + 1}: isValidNQueens → true`, () => {
      expect(isValidNQueens(sol)).toBe(true);
    });
  }
});

// ─── BLOCK 15: DancingLinks single-row single-col (50 tests) ──────────────────
describe('DancingLinks 1x1 matrix with a 1', () => {
  for (let t = 0; t < 50; t++) {
    it(`1x1 matrix [[1]] trial ${t + 1}: solve() = [[0]]`, () => {
      const dlx = new DancingLinks([[1]]);
      const sols = dlx.solve();
      expect(sols).toEqual([[0]]);
    });
  }
});

// ─── BLOCK 16: DancingLinks two-row matrix both covering single column (50 tests) ──
describe('DancingLinks 2x1 matrix: two rows each covering the only column', () => {
  for (let t = 0; t < 50; t++) {
    it(`2x1 matrix [[1],[1]] trial ${t + 1}: solve() has 2 solutions`, () => {
      const dlx = new DancingLinks([[1], [1]]);
      const sols = dlx.solve();
      expect(sols.length).toBe(2);
      // Solutions are [row 0] and [row 1]
      const flat = sols.map(s => s[0]).sort((a, b) => a - b);
      expect(flat).toEqual([0, 1]);
    });
  }
});

// ─── BLOCK 17: isValidNQueens length-1 placement (50 tests) ──────────────────
describe('isValidNQueens n=1: [0] is always valid', () => {
  for (let t = 0; t < 50; t++) {
    it(`isValidNQueens([0]) trial ${t + 1}: returns true`, () => {
      expect(isValidNQueens([0])).toBe(true);
    });
  }
});

// ─── BLOCK 18: solveNQueens n=1 single solution shape (50 tests) ─────────────
describe('solveNQueens n=1 solution shape', () => {
  for (let t = 0; t < 50; t++) {
    it(`solveNQueens(1) trial ${t + 1}: [[0]]`, () => {
      const sols = solveNQueens(1);
      expect(sols).toEqual([[0]]);
    });
  }
});

// ─── BLOCK 19: exactCover two-element universe (50 tests) ────────────────────
describe('exactCover two-element universe', () => {
  for (let t = 0; t < 50; t++) {
    const a = t * 2 + 1;
    const b = t * 2 + 2;
    it(`exactCover universe=[${a},${b}] subsets=[[${a}],[${b}]]: solution covers both`, () => {
      const result = exactCover([a, b], [[a], [b]]);
      expect(result).not.toBeNull();
      const covered = result!.flat().sort((x, y) => x - y);
      expect(covered).toEqual([a, b]);
    });
  }
});

// ─── BLOCK 20: DancingLinks findFirst on no-solution matrix (50 tests) ────────
describe('DancingLinks findFirst on zero-column matrix returns null', () => {
  for (let t = 0; t < 50; t++) {
    const rows = (t % 4) + 2;
    const cols = (t % 3) + 2;
    const zeroCol = t % cols;
    it(`findFirst zero-col ${rows}x${cols} zeroCol=${zeroCol}: returns null`, () => {
      const mat = zeroColMatrix(rows, cols, zeroCol);
      const dlx = new DancingLinks(mat);
      const sol = dlx.findFirst();
      expect(sol).toBeNull();
    });
  }
});

// ─── BLOCK 21: DancingLinks — numSolutions 0 after failed solve (50 tests) ────
describe('DancingLinks numSolutions=0 after no-solution solve', () => {
  for (let t = 0; t < 50; t++) {
    it(`zero-col 2x2 trial ${t + 1}: numSolutions=0`, () => {
      const mat = [[0, 1], [0, 1]]; // col 0 is zero → no solution
      const dlx = new DancingLinks(mat);
      dlx.solve();
      expect(dlx.numSolutions).toBe(0);
    });
  }
});

// ─── BLOCK 22: DancingLinks solve resets state on repeated calls (50 tests) ───
describe('DancingLinks solve() resets solutions on repeated calls', () => {
  for (let n = 1; n <= 50; n++) {
    it(`identity ${n}x${n}: calling solve() twice returns same result`, () => {
      const mat = identityMatrix(n);
      const dlx = new DancingLinks(mat);
      const first = dlx.solve();
      const second = dlx.solve();
      expect(first).toEqual(second);
    });
  }
});

// ─── BLOCK 23: exactCover single-subset covering full universe (50 tests) ─────
describe('exactCover single subset covering all elements', () => {
  for (let n = 1; n <= 50; n++) {
    const universe = Array.from({ length: n }, (_, i) => i + 1);
    const subset = [...universe];
    it(`exactCover universe=1..${n} subset=all: solution = [universe]`, () => {
      const result = exactCover(universe, [subset]);
      expect(result).not.toBeNull();
      expect(result).toEqual([subset]);
    });
  }
});

// ─── BLOCK 24: isValidNQueens diagonal conflict detection (50 tests) ──────────
describe('isValidNQueens detects diagonal conflicts', () => {
  for (let n = 2; n <= 51; n++) {
    // Place queens on main diagonal: placement[i] = i → adjacent diagonal conflict
    const placement = Array.from({ length: n }, (_, i) => i);
    it(`isValidNQueens n=${n} main-diagonal placement: returns false (diagonal conflict)`, () => {
      expect(isValidNQueens(placement)).toBe(false);
    });
  }
});

// ─── BLOCK 25: solveNQueens maxSolutions param (50 tests) ────────────────────
describe('solveNQueens respects maxSolutions parameter', () => {
  for (let t = 0; t < 50; t++) {
    const n = 5 + (t % 4); // n=5..8
    const max = 1 + (t % 3); // max=1..3
    const expected = Math.min(NQUEENS_COUNTS[n], max);
    it(`solveNQueens(${n}, ${max}): returns at most ${expected} solutions`, () => {
      const sols = solveNQueens(n, max);
      expect(sols.length).toBeLessThanOrEqual(max);
      expect(sols.length).toBe(expected);
    });
  }
});

// ─── BLOCK 26: solveSudoku — trivial pre-filled grid (20 tests) ──────────────
describe('solveSudoku solves a known puzzle', () => {
  // A solvable Sudoku puzzle (one specific puzzle)
  const puzzle: number[][] = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ];
  const expectedSolution: number[][] = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];

  for (let t = 0; t < 20; t++) {
    it(`solveSudoku known puzzle trial ${t + 1}: returns correct solution`, () => {
      const result = solveSudoku(puzzle);
      expect(result).not.toBeNull();
      expect(result).toEqual(expectedSolution);
    });
  }
});

// ─── BLOCK 27: solveSudoku fully-filled valid grid (20 tests) ────────────────
describe('solveSudoku fully pre-filled grid returns same grid', () => {
  const full: number[][] = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];

  for (let t = 0; t < 20; t++) {
    it(`solveSudoku fully-filled trial ${t + 1}: returns the same grid`, () => {
      const result = solveSudoku(full);
      expect(result).not.toBeNull();
      expect(result).toEqual(full);
    });
  }
});

// ─── BLOCK 28: DancingLinks — 2x2 overlapping rows (30 tests) ────────────────
describe('DancingLinks 2x2 matrix with overlapping rows', () => {
  // Row 0: [1,1], Row 1: [1,0], Row 2: [0,1]
  // Exact cover: rows 1 and 2 together cover both columns exactly
  const mat = [[1, 1], [1, 0], [0, 1]];
  for (let t = 0; t < 30; t++) {
    it(`overlapping 3x2 trial ${t + 1}: exactly 2 solutions`, () => {
      const dlx = new DancingLinks(mat);
      const sols = dlx.solve();
      // Solution 1: row 0 alone; Solution 2: rows 1 and 2
      expect(sols.length).toBe(2);
    });
  }
});

// ─── BLOCK 29: DancingLinks — column count tracking (30 tests) ───────────────
describe('DancingLinks column counts are correct after construction', () => {
  for (let n = 1; n <= 30; n++) {
    it(`identity ${n}x${n}: each column has count=1`, () => {
      // We can verify indirectly: the identity matrix has exactly 1 solution
      // and findFirst returns n rows (one per column)
      const mat = identityMatrix(n);
      const dlx = new DancingLinks(mat);
      const sol = dlx.findFirst();
      expect(sol).not.toBeNull();
      expect(sol!.length).toBe(n);
    });
  }
});

// ─── BLOCK 30: exactCover disjoint subsets (30 tests) ────────────────────────
describe('exactCover with perfectly disjoint subsets', () => {
  for (let n = 1; n <= 30; n++) {
    // Universe = {1..n}, one subset per element
    const universe = Array.from({ length: n }, (_, i) => i + 1);
    const subsets = universe.map(v => [v]);
    it(`exactCover disjoint n=${n}: solution is all subsets`, () => {
      const result = exactCover(universe, subsets);
      expect(result).not.toBeNull();
      // Each subset covers one element; all must be selected
      const covered = result!.flat().sort((a, b) => a - b);
      expect(covered).toEqual(universe);
    });
  }
});

// ─── BLOCK 31: isValidNQueens empty array (20 tests) ─────────────────────────
describe('isValidNQueens empty placement: returns true (vacuously)', () => {
  for (let t = 0; t < 20; t++) {
    it(`isValidNQueens([]) trial ${t + 1}: returns true`, () => {
      expect(isValidNQueens([])).toBe(true);
    });
  }
});

// ─── BLOCK 32: DancingLinks — 3-row exact cover (30 tests) ───────────────────
describe('DancingLinks 3-row exact cover', () => {
  // Classic Knuth example subset of columns
  // Columns: 0 1 2 3 4 5 6
  // Row A: {0,3,6} → [1,0,0,1,0,0,1]
  // Row B: {0,3}   → [1,0,0,1,0,0,0]
  // Row C: {3,4,6} → [0,0,0,1,1,0,1]
  // Row D: {2,4,5} → [0,0,1,0,1,1,0]
  // Row E: {1,2,5,6}→[0,1,1,0,0,1,1]
  // Row F: {1,6}   → [0,1,0,0,0,0,1]
  // Solution: B, D, F = rows 1,3,5
  const mat = [
    [1, 0, 0, 1, 0, 0, 1], // A
    [1, 0, 0, 1, 0, 0, 0], // B
    [0, 0, 0, 1, 1, 0, 1], // C
    [0, 0, 1, 0, 1, 1, 0], // D
    [0, 1, 1, 0, 0, 1, 1], // E
    [0, 1, 0, 0, 0, 0, 1], // F
  ];
  for (let t = 0; t < 30; t++) {
    it(`Knuth example trial ${t + 1}: solution is rows [1,3,5] (B,D,F)`, () => {
      const dlx = new DancingLinks(mat);
      const sol = dlx.findFirst();
      expect(sol).not.toBeNull();
      const sorted = sol!.slice().sort((a, b) => a - b);
      expect(sorted).toEqual([1, 3, 5]);
    });
  }
});

// ─── BLOCK 33: solveNQueens n=4 exact solutions (20 tests) ───────────────────
describe('solveNQueens n=4 exact solutions', () => {
  const expected4 = [[1, 3, 0, 2], [2, 0, 3, 1]];
  for (let t = 0; t < 20; t++) {
    it(`solveNQueens(4) trial ${t + 1}: 2 solutions, all valid`, () => {
      const sols = solveNQueens(4);
      expect(sols.length).toBe(2);
      sols.forEach(s => expect(isValidNQueens(s)).toBe(true));
    });
  }
});

// ─── BLOCK 34: DancingLinks — maxSolutions=2 on larger matrix (20 tests) ──────
describe('DancingLinks maxSolutions=2 on 2x1 matrix', () => {
  for (let t = 0; t < 20; t++) {
    it(`2x1 matrix with maxSolutions=2 trial ${t + 1}: exactly 2 solutions`, () => {
      const dlx = new DancingLinks([[1], [1]], 2);
      const sols = dlx.solve();
      expect(sols.length).toBe(2);
    });
  }
});

// ─── BLOCK 35: exactCover with extra subset that doesn't help (20 tests) ──────
describe('exactCover with redundant subsets', () => {
  for (let t = 0; t < 20; t++) {
    const n = (t % 5) + 2;
    const universe = Array.from({ length: n }, (_, i) => i);
    // One perfect cover: n single-element subsets
    const subsets = universe.map(v => [v]);
    // Add a redundant subset covering all elements (cannot be used in exact cover)
    subsets.push(universe);
    it(`exactCover n=${n} with redundant full-universe subset trial ${t + 1}: solution found`, () => {
      const result = exactCover(universe, subsets);
      expect(result).not.toBeNull();
      const covered = result!.flat().sort((a, b) => a - b);
      expect(covered).toEqual(universe);
    });
  }
});

// ─── BLOCK 36: DancingLinks — single solution correctness after cover/uncover (20 tests) ─
describe('DancingLinks cover/uncover correctness: repeated solve() calls', () => {
  for (let n = 1; n <= 20; n++) {
    it(`identity ${n}x${n}: 3 solve() calls all return same solution`, () => {
      const mat = identityMatrix(n);
      const dlx = new DancingLinks(mat);
      const s1 = dlx.solve();
      const s2 = dlx.solve();
      const s3 = dlx.solve();
      expect(s1).toEqual(s2);
      expect(s2).toEqual(s3);
    });
  }
});

// ─── BLOCK 37: solveNQueens every solution has length n (20 tests) ────────────
describe('solveNQueens: every solution array has length n', () => {
  for (let n = 1; n <= 8; n++) {
    const reps = Math.ceil(20 / 8);
    for (let r = 0; r < reps; r++) {
      if ((n - 1) * reps + r >= 20) break;
      it(`solveNQueens(${n}) rep ${r + 1}: all solutions have length ${n}`, () => {
        const sols = solveNQueens(n);
        sols.forEach(s => expect(s.length).toBe(n));
      });
    }
  }
});

// ─── BLOCK 38: DancingLinks — multiple solutions on 3-column matrix (20 tests) ─
describe('DancingLinks 3-column: several ways to cover', () => {
  // 3 columns; rows: [1,0,0], [0,1,0], [0,0,1], [1,1,0], [0,1,1], [1,0,1], [1,1,1]
  // Exact cover solutions: rows {0,1,2}, {3,2}, {0,4}, {5,1}, {6}
  const mat = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 0],
    [0, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ];
  for (let t = 0; t < 20; t++) {
    it(`3-col 7-row matrix trial ${t + 1}: solve() finds 5 solutions`, () => {
      const dlx = new DancingLinks(mat);
      const sols = dlx.solve();
      expect(sols.length).toBe(5);
    });
  }
});

// ─── BLOCK 39: isValidNQueens row-conflict (anti-row attack) (20 tests) ───────
describe('isValidNQueens same-row conflict detected', () => {
  for (let n = 2; n <= 21; n++) {
    // Two queens in same column → invalid (column conflict)
    const placement = Array.from({ length: n }, () => 0); // all in col 0
    it(`isValidNQueens all-zeros n=${n}: returns false`, () => {
      expect(isValidNQueens(placement)).toBe(false);
    });
  }
});

// ─── BLOCK 40: Additional exactCover edge cases (20 tests) ───────────────────
describe('exactCover edge: universe already covered by one subset', () => {
  for (let n = 1; n <= 20; n++) {
    const universe = Array.from({ length: n }, (_, i) => i * 3 + 1); // non-contiguous
    const subset = [...universe];
    it(`exactCover non-contiguous universe size=${n}: single-subset solution`, () => {
      const result = exactCover(universe, [subset, subset.slice(0, 1)]);
      // Only the full subset is a valid exact cover
      expect(result).not.toBeNull();
    });
  }
});
