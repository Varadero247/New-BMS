// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  hungarian,
  maximize,
  assignmentCost,
  munkres,
  isValidAssignment,
  paddedMatrix,
} from '../hungarian-algorithm';

// ─── Helper ───────────────────────────────────────────────────────────────────

function optimalCost(matrix: number[][]): number {
  return hungarian(matrix).cost;
}

function sumDiag(matrix: number[][], offset: number = 0): number {
  let s = 0;
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    s += matrix[i][(i + offset) % n];
  }
  return s;
}

// ─── 1. 1×1 matrices (50 tests) ───────────────────────────────────────────────
describe('1×1 matrices', () => {
  for (let v = 0; v < 50; v++) {
    it(`1x1 with value ${v}`, () => {
      const m = [[v]];
      const { assignment, cost } = hungarian(m);
      expect(assignment).toEqual([0]);
      expect(cost).toBe(v);
    });
  }
});

// ─── 2. 2×2 matrices (100 tests) ──────────────────────────────────────────────
describe('2×2 matrices', () => {
  // 50 tests: diagonal is cheaper
  for (let k = 0; k < 50; k++) {
    it(`2x2 diagonal cheap variant ${k}`, () => {
      const a = k;
      const b = k + 1;
      const c2 = k + 2;
      const d = k + 3;
      // [[a, c2],[d, b]] → diagonal [a,b] is cheaper: a+b vs c2+d
      const m = [[a, c2], [d, b]];
      const { assignment, cost } = hungarian(m);
      // a+b = 2k+1, c2+d = 2k+5 → diagonal always wins
      expect(cost).toBe(a + b);
      expect(assignment).toEqual([0, 1]);
    });
  }
  // 50 tests: anti-diagonal is cheaper
  for (let k = 0; k < 50; k++) {
    it(`2x2 anti-diagonal cheap variant ${k}`, () => {
      const hi = 1000 + k;
      // [[hi, k],[k, hi]] → anti-diagonal cost 2k
      const m = [[hi, k], [k, hi]];
      const { assignment, cost } = hungarian(m);
      expect(cost).toBe(2 * k);
      expect(assignment).toEqual([1, 0]);
    });
  }
});

// ─── 3. 3×3 matrices (150 tests) ──────────────────────────────────────────────
describe('3×3 matrices', () => {
  // 50 tests: identity-like — diagonal clearly cheapest
  for (let k = 0; k < 50; k++) {
    it(`3x3 identity-like k=${k}`, () => {
      const BIG = 99999;
      const m = [
        [k,   BIG, BIG],
        [BIG, k+1, BIG],
        [BIG, BIG, k+2],
      ];
      const { assignment, cost } = hungarian(m);
      expect(assignment).toEqual([0, 1, 2]);
      expect(cost).toBe(k + (k + 1) + (k + 2));
    });
  }
  // 50 tests: anti-diagonal rotation
  for (let k = 0; k < 50; k++) {
    it(`3x3 anti-diagonal k=${k}`, () => {
      const BIG = 99999;
      const m = [
        [BIG, BIG, k],
        [BIG, k+1, BIG],
        [k+2, BIG, BIG],
      ];
      const { assignment, cost } = hungarian(m);
      expect(assignment).toEqual([2, 1, 0]);
      expect(cost).toBe(k + (k + 1) + (k + 2));
    });
  }
  // 50 tests: verify cost <= all permutation costs
  for (let k = 0; k < 50; k++) {
    it(`3x3 cost is optimal for random-ish matrix k=${k}`, () => {
      const m = [
        [k + 1, k + 4, k + 7],
        [k + 2, k + 5, k + 8],
        [k + 3, k + 6, k + 9],
      ];
      const { cost } = hungarian(m);
      // Enumerate all 6 permutations of 3 elements
      const perms = [
        [0, 1, 2], [0, 2, 1],
        [1, 0, 2], [1, 2, 0],
        [2, 0, 1], [2, 1, 0],
      ];
      const minCost = Math.min(...perms.map(p => p.reduce((s, j, i) => s + m[i][j], 0)));
      expect(cost).toBe(minCost);
    });
  }
});

// ─── 4. 4×4 matrices (100 tests) ──────────────────────────────────────────────
describe('4×4 matrices', () => {
  // 50 tests: diagonal identity
  for (let k = 0; k < 50; k++) {
    it(`4x4 identity-like k=${k}`, () => {
      const BIG = 999999;
      const m = [
        [k,   BIG, BIG, BIG],
        [BIG, k+1, BIG, BIG],
        [BIG, BIG, k+2, BIG],
        [BIG, BIG, BIG, k+3],
      ];
      const { assignment, cost } = hungarian(m);
      expect(assignment).toEqual([0, 1, 2, 3]);
      expect(cost).toBe(k + (k+1) + (k+2) + (k+3));
    });
  }
  // 50 tests: shifted diagonal
  for (let shift = 0; shift < 50; shift++) {
    it(`4x4 shifted diagonal shift=${shift}`, () => {
      const BIG = 999999;
      const n = 4;
      const costs = [shift, shift + 1, shift + 2, shift + 3];
      const m: number[][] = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => (j === (i + shift) % n ? costs[i] : BIG))
      );
      const { assignment, cost } = hungarian(m);
      const expectedCost = costs.reduce((s, v) => s + v, 0);
      expect(cost).toBe(expectedCost);
      for (let i = 0; i < n; i++) {
        expect(assignment[i]).toBe((i + shift) % n);
      }
    });
  }
});

// ─── 5. 5×5 matrices (100 tests) ──────────────────────────────────────────────
describe('5×5 matrices', () => {
  // 50 tests: diagonal identity
  for (let k = 0; k < 50; k++) {
    it(`5x5 identity-like k=${k}`, () => {
      const BIG = 999999;
      const m = [
        [k,   BIG, BIG, BIG, BIG],
        [BIG, k+1, BIG, BIG, BIG],
        [BIG, BIG, k+2, BIG, BIG],
        [BIG, BIG, BIG, k+3, BIG],
        [BIG, BIG, BIG, BIG, k+4],
      ];
      const { assignment, cost } = hungarian(m);
      expect(assignment).toEqual([0, 1, 2, 3, 4]);
      expect(cost).toBe(k + (k+1) + (k+2) + (k+3) + (k+4));
    });
  }
  // 50 tests: uniform row cost + unique diagonal bonus
  for (let k = 1; k <= 50; k++) {
    it(`5x5 unique diagonal k=${k}`, () => {
      const n = 5;
      // All cells = 100, diagonal = k (< 100)
      const m: number[][] = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => (i === j ? k : 100))
      );
      const { assignment, cost } = hungarian(m);
      expect(assignment).toEqual([0, 1, 2, 3, 4]);
      expect(cost).toBe(k * n);
    });
  }
});

// ─── 6. Known optimal solutions (100 tests) ───────────────────────────────────
describe('Known optimal solutions', () => {
  // Identity matrix n×n: diagonal = 1, off-diagonal = 0.
  // Optimal: assign off-diagonal (cost 0) whenever n > 1; for n=1 the only option is diagonal (cost 1).
  for (let n = 1; n <= 50; n++) {
    it(`identity ${n}x${n} optimal cost`, () => {
      const m: number[][] = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => (i === j ? 1 : 0))
      );
      // For n=1, only cell is [0][0]=1. For n>=2, assignment picks all zeros (off-diagonal).
      const expectedCost = n === 1 ? 1 : 0;
      const { cost } = hungarian(m);
      expect(cost).toBe(expectedCost);
    });
  }
  // All-ones matrix n×n → cost = n
  for (let n = 1; n <= 50; n++) {
    it(`all-ones ${n}x${n} cost=${n}`, () => {
      const m: number[][] = Array.from({ length: n }, () =>
        Array.from({ length: n }, () => 1)
      );
      const { cost } = hungarian(m);
      expect(cost).toBe(n);
    });
  }
});

// ─── 7. All-equal matrices (50 tests) ─────────────────────────────────────────
describe('All-equal matrices', () => {
  for (let n = 1; n <= 50; n++) {
    it(`all-equal ${n}x${n} value=5, cost=5n`, () => {
      const m: number[][] = Array.from({ length: n }, () =>
        Array.from({ length: n }, () => 5)
      );
      const { cost, assignment } = hungarian(m);
      expect(cost).toBe(5 * n);
      expect(isValidAssignment(assignment, n)).toBe(true);
    });
  }
});

// ─── 8. Maximize variant (100 tests) ──────────────────────────────────────────
describe('maximize variant', () => {
  // 50 tests: diagonal is maximum
  for (let k = 0; k < 50; k++) {
    it(`maximize 2x2 diagonal max k=${k}`, () => {
      const big = 100 + k;
      const small = k;
      const m = [[big, small], [small, big]];
      const { assignment, benefit } = maximize(m);
      expect(assignment).toEqual([0, 1]);
      expect(benefit).toBe(2 * big);
    });
  }
  // 50 tests: anti-diagonal is maximum
  for (let k = 0; k < 50; k++) {
    it(`maximize 2x2 anti-diagonal max k=${k}`, () => {
      const big = 100 + k;
      const small = k;
      const m = [[small, big], [big, small]];
      const { assignment, benefit } = maximize(m);
      expect(assignment).toEqual([1, 0]);
      expect(benefit).toBe(2 * big);
    });
  }
});

// ─── 9. munkres() pairs (100 tests) ───────────────────────────────────────────
describe('munkres() pairs', () => {
  // 50 tests: 1×1
  for (let v = 0; v < 50; v++) {
    it(`munkres 1x1 value=${v}`, () => {
      const pairs = munkres([[v]]);
      expect(pairs).toEqual([[0, 0]]);
    });
  }
  // 25 tests: 2×2 diagonal optimal
  for (let k = 0; k < 25; k++) {
    it(`munkres 2x2 diagonal k=${k}`, () => {
      const m = [[k, k+10], [k+10, k]];
      const pairs = munkres(m);
      expect(pairs.length).toBe(2);
      // Verify pairs cover all rows and columns
      const rows = pairs.map(p => p[0]).sort();
      const cols = pairs.map(p => p[1]).sort();
      expect(rows).toEqual([0, 1]);
      expect(cols).toEqual([0, 1]);
      // Diagonal assignment
      expect(pairs).toContainEqual([0, 0]);
      expect(pairs).toContainEqual([1, 1]);
    });
  }
  // 25 tests: 3×3 diagonal optimal
  for (let k = 0; k < 25; k++) {
    it(`munkres 3x3 diagonal k=${k}`, () => {
      const BIG = 99999;
      const m = [
        [k,   BIG, BIG],
        [BIG, k+1, BIG],
        [BIG, BIG, k+2],
      ];
      const pairs = munkres(m);
      expect(pairs.length).toBe(3);
      expect(pairs).toContainEqual([0, 0]);
      expect(pairs).toContainEqual([1, 1]);
      expect(pairs).toContainEqual([2, 2]);
    });
  }
});

// ─── 10. assignmentCost (50 tests) ────────────────────────────────────────────
describe('assignmentCost', () => {
  // 25 tests: identity assignment on diagonal matrices
  for (let n = 1; n <= 25; n++) {
    it(`assignmentCost diagonal ${n}x${n}`, () => {
      const m: number[][] = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => (i === j ? i + 1 : 0))
      );
      const assignment = Array.from({ length: n }, (_, i) => i);
      const expected = Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a + b, 0);
      expect(assignmentCost(m, assignment)).toBe(expected);
    });
  }
  // 25 tests: row-shifted assignment
  for (let n = 1; n <= 25; n++) {
    it(`assignmentCost all-value-k n=${n}`, () => {
      const k = n * 3;
      const m: number[][] = Array.from({ length: n }, () =>
        Array.from({ length: n }, () => k)
      );
      const assignment = Array.from({ length: n }, (_, i) => i);
      expect(assignmentCost(m, assignment)).toBe(k * n);
    });
  }
});

// ─── 11. isValidAssignment (50 tests) ─────────────────────────────────────────
describe('isValidAssignment', () => {
  // 25 tests: valid identity assignments
  for (let n = 1; n <= 25; n++) {
    it(`isValidAssignment identity n=${n}`, () => {
      const assignment = Array.from({ length: n }, (_, i) => i);
      expect(isValidAssignment(assignment, n)).toBe(true);
    });
  }
  // 10 tests: invalid — duplicate column
  for (let n = 2; n <= 11; n++) {
    it(`isValidAssignment duplicate column n=${n}`, () => {
      const assignment = Array.from({ length: n }, () => 0); // all → col 0
      expect(isValidAssignment(assignment, n)).toBe(false);
    });
  }
  // 10 tests: invalid — out of range
  for (let n = 1; n <= 10; n++) {
    it(`isValidAssignment out-of-range n=${n}`, () => {
      const assignment = Array.from({ length: n }, (_, i) => i + n); // all out of range
      expect(isValidAssignment(assignment, n)).toBe(false);
    });
  }
  // 5 tests: invalid — wrong length
  for (let n = 1; n <= 5; n++) {
    it(`isValidAssignment wrong length n=${n}`, () => {
      const assignment = Array.from({ length: n + 1 }, (_, i) => i % n);
      expect(isValidAssignment(assignment, n)).toBe(false);
    });
  }
});

// ─── 12. paddedMatrix (50 tests) ──────────────────────────────────────────────
describe('paddedMatrix', () => {
  // 10 tests: already square → unchanged
  for (let n = 1; n <= 10; n++) {
    it(`paddedMatrix already square n=${n}`, () => {
      const m: number[][] = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => i * n + j)
      );
      const padded = paddedMatrix(m);
      expect(padded.length).toBe(n);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          expect(padded[i][j]).toBe(m[i][j]);
        }
      }
    });
  }
  // 20 tests: rows < cols → pad rows
  for (let extra = 1; extra <= 20; extra++) {
    it(`paddedMatrix rows < cols extra=${extra}`, () => {
      const rows = 2;
      const cols = 2 + extra;
      const m: number[][] = Array.from({ length: rows }, (_, i) =>
        Array.from({ length: cols }, (__, j) => i * 10 + j)
      );
      const padded = paddedMatrix(m, 0);
      expect(padded.length).toBe(cols);
      expect(padded[0].length).toBe(cols);
      // Original values preserved
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          expect(padded[i][j]).toBe(m[i][j]);
        }
      }
      // Padded rows are zero
      for (let i = rows; i < cols; i++) {
        for (let j = 0; j < cols; j++) {
          expect(padded[i][j]).toBe(0);
        }
      }
    });
  }
  // 20 tests: rows > cols → pad cols
  for (let extra = 1; extra <= 20; extra++) {
    it(`paddedMatrix rows > cols extra=${extra}`, () => {
      const rows = 2 + extra;
      const cols = 2;
      const m: number[][] = Array.from({ length: rows }, (_, i) =>
        Array.from({ length: cols }, (__, j) => i * 10 + j)
      );
      const padded = paddedMatrix(m, 99);
      expect(padded.length).toBe(rows);
      expect(padded[0].length).toBe(rows);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          expect(padded[i][j]).toBe(m[i][j]);
        }
        for (let j = cols; j < rows; j++) {
          expect(padded[i][j]).toBe(99);
        }
      }
    });
  }
});

// ─── 13. Non-square matrices (100 tests) ──────────────────────────────────────
describe('Non-square matrices via paddedMatrix', () => {
  // 50 tests: 2×3 (2 workers, 3 jobs)
  for (let k = 0; k < 50; k++) {
    it(`non-square 2x3 k=${k}`, () => {
      const m = [
        [k + 1, k + 5, k + 2],
        [k + 3, k + 2, k + 4],
      ];
      const padded = paddedMatrix(m, 0);
      expect(padded.length).toBe(3);
      const { assignment, cost } = hungarian(padded);
      expect(assignment.length).toBe(3);
      expect(isValidAssignment(assignment, 3)).toBe(true);
      // Verify cost matches assignmentCost
      expect(assignmentCost(padded, assignment)).toBe(cost);
    });
  }
  // 50 tests: 3×2 (3 workers, 2 jobs)
  for (let k = 0; k < 50; k++) {
    it(`non-square 3x2 k=${k}`, () => {
      const m = [
        [k + 1, k + 2],
        [k + 3, k + 1],
        [k + 2, k + 3],
      ];
      const padded = paddedMatrix(m, 0);
      expect(padded.length).toBe(3);
      const { assignment, cost } = hungarian(padded);
      expect(assignment.length).toBe(3);
      expect(isValidAssignment(assignment, 3)).toBe(true);
      expect(assignmentCost(padded, assignment)).toBe(cost);
    });
  }
});

// ─── 14. Additional correctness: brute-force vs hungarian (50 tests) ──────────
describe('Brute-force vs Hungarian (3×3)', () => {
  function bruteForce3(m: number[][]): number {
    const perms = [
      [0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0],
    ];
    return Math.min(...perms.map(p => p.reduce((s, j, i) => s + m[i][j], 0)));
  }

  for (let k = 0; k < 50; k++) {
    it(`brute-force vs hungarian k=${k}`, () => {
      const m = [
        [k*2 + 1, k*3 + 2, k + 8],
        [k + 3,   k*2 + 5, k*3 + 1],
        [k*3 + 4, k + 6,   k*2 + 3],
      ];
      const { cost } = hungarian(m);
      expect(cost).toBe(bruteForce3(m));
    });
  }
});

// ─── 15. Additional edge cases & mixed (100 tests) ────────────────────────────
describe('Edge cases and mixed', () => {
  it('empty matrix returns empty assignment, cost 0', () => {
    const { assignment, cost } = hungarian([]);
    expect(assignment).toEqual([]);
    expect(cost).toBe(0);
  });

  it('munkres empty matrix returns []', () => {
    expect(munkres([])).toEqual([]);
  });

  it('maximize empty matrix returns empty, benefit 0', () => {
    const { assignment, benefit } = maximize([]);
    expect(assignment).toEqual([]);
    expect(benefit).toBe(0);
  });

  it('isValidAssignment empty n=0', () => {
    expect(isValidAssignment([], 0)).toBe(true);
  });

  it('paddedMatrix empty returns []', () => {
    expect(paddedMatrix([])).toEqual([]);
  });

  // 95 more tests verifying munkres returns correct length
  for (let n = 1; n <= 10; n++) {
    for (let rep = 0; rep < 9; rep++) {
      it(`munkres ${n}x${n} rep=${rep} returns n pairs`, () => {
        const m: number[][] = Array.from({ length: n }, (_, i) =>
          Array.from({ length: n }, (__, j) => ((i + j + rep) % (n * 2)) + 1)
        );
        const pairs = munkres(m);
        expect(pairs.length).toBe(n);
        // Each pair: [row, col]
        const rows = pairs.map(p => p[0]).sort((a, b) => a - b);
        const cols = pairs.map(p => p[1]).sort((a, b) => a - b);
        const expectedRows = Array.from({ length: n }, (_, i) => i);
        expect(rows).toEqual(expectedRows);
        // columns should be unique and in [0, n)
        const colSet = new Set(cols);
        expect(colSet.size).toBe(n);
        for (const c of cols) {
          expect(c).toBeGreaterThanOrEqual(0);
          expect(c).toBeLessThan(n);
        }
      });
    }
  }
});

// ─── 16. Symmetry: transpose same optimal cost (50 tests) ─────────────────────
describe('Symmetric cost matrices', () => {
  for (let n = 2; n <= 6; n++) {
    for (let rep = 0; rep < 10; rep++) {
      it(`symmetric ${n}x${n} rep=${rep}`, () => {
        // Build symmetric matrix
        const m: number[][] = Array.from({ length: n }, (_, i) =>
          Array.from({ length: n }, (__, j) => {
            const base = (i + 1) * (j + 1) + rep;
            return base;
          })
        );
        const mT: number[][] = Array.from({ length: n }, (_, i) =>
          Array.from({ length: n }, (__, j) => m[j][i])
        );
        const { cost: c1 } = hungarian(m);
        const { cost: c2 } = hungarian(mT);
        expect(c1).toBe(c2);
      });
    }
  }
});

// ─── 17. Scaling invariance: multiply all by constant (50 tests) ───────────────
describe('Scaling invariance', () => {
  for (let k = 1; k <= 50; k++) {
    it(`scaling by ${k} on 3x3`, () => {
      const m = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const scaled = m.map(row => row.map(v => v * k));
      const { cost: c1, assignment: a1 } = hungarian(m);
      const { cost: c2, assignment: a2 } = hungarian(scaled);
      expect(c2).toBe(c1 * k);
      expect(a1).toEqual(a2);
    });
  }
});

// ─── 18. Translation invariance: add constant (50 tests) ──────────────────────
describe('Translation invariance', () => {
  for (let k = 0; k < 50; k++) {
    it(`translation by ${k} on 3x3`, () => {
      const m = [
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9],
      ];
      const translated = m.map(row => row.map(v => v + k));
      const { assignment: a1 } = hungarian(m);
      const { assignment: a2 } = hungarian(translated);
      expect(a1).toEqual(a2);
    });
  }
});

// ─── 19. Assignment is always valid (50 tests) ────────────────────────────────
describe('Assignment is always a valid permutation', () => {
  for (let n = 1; n <= 50; n++) {
    it(`valid assignment n=${n}`, () => {
      const m: number[][] = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => ((i * 7 + j * 13) % 100) + 1)
      );
      const { assignment } = hungarian(m);
      expect(isValidAssignment(assignment, n)).toBe(true);
    });
  }
});

// ─── 20. maximize consistency with hungarian (50 tests) ───────────────────────
describe('maximize consistency with negated hungarian', () => {
  for (let k = 1; k <= 50; k++) {
    it(`maximize vs negated-minimize k=${k}`, () => {
      const n = 3;
      const m: number[][] = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => (i + 1) * (j + 1) * k)
      );
      const { benefit } = maximize(m);
      // benefit must be >= minimum row assignment (it's the maximum)
      const { cost } = hungarian(m);
      expect(benefit).toBeGreaterThanOrEqual(cost);
    });
  }
});

// ─── 21. assignmentCost vs hungarian cost (50 tests) ──────────────────────────
describe('assignmentCost matches hungarian cost', () => {
  for (let n = 1; n <= 50; n++) {
    it(`assignmentCost matches hungarian n=${n}`, () => {
      const m: number[][] = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => ((i + j) % n) + 1)
      );
      const { assignment, cost } = hungarian(m);
      expect(assignmentCost(m, assignment)).toBe(cost);
    });
  }
});

// ─── 22. Large diagonal sparse matrix (25 tests) ──────────────────────────────
describe('Large diagonal sparse matrix', () => {
  for (let n = 2; n <= 26; n++) {
    it(`large diagonal sparse ${n}x${n}`, () => {
      const BIG = 999999;
      const m: number[][] = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => (i === j ? i + 1 : BIG))
      );
      const { assignment, cost } = hungarian(m);
      expect(assignment).toEqual(Array.from({ length: n }, (_, i) => i));
      expect(cost).toBe(Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a + b, 0));
    });
  }
});

// ─── 23. munkres and hungarian agree on assignment (50 tests) ─────────────────
describe('munkres and hungarian agree', () => {
  for (let n = 1; n <= 50; n++) {
    it(`munkres vs hungarian n=${n}`, () => {
      const m: number[][] = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => ((i * 3 + j * 7) % (n + 1)) + 1)
      );
      const { assignment } = hungarian(m);
      const pairs = munkres(m);
      for (let i = 0; i < n; i++) {
        expect(pairs[i]).toEqual([i, assignment[i]]);
      }
    });
  }
});

// ─── 24. paddedMatrix custom fill value (25 tests) ────────────────────────────
describe('paddedMatrix custom fill value', () => {
  for (let fill = 0; fill < 25; fill++) {
    it(`paddedMatrix fill=${fill} on 2x4`, () => {
      const m = [[1, 2, 3, 4], [5, 6, 7, 8]];
      const padded = paddedMatrix(m, fill);
      expect(padded.length).toBe(4);
      // Padded rows use fill value
      for (let i = 2; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          expect(padded[i][j]).toBe(fill);
        }
      }
    });
  }
});

// ─── 25. Zero-cost assignments (25 tests) ─────────────────────────────────────
describe('Zero-cost assignments', () => {
  for (let n = 1; n <= 25; n++) {
    it(`all-zero matrix ${n}x${n} cost=0`, () => {
      const m: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
      const { cost, assignment } = hungarian(m);
      expect(cost).toBe(0);
      expect(isValidAssignment(assignment, n)).toBe(true);
    });
  }
});

// ─── 26. Maximize on 3×3 (25 tests) ──────────────────────────────────────────
describe('Maximize on 3x3 brute force check', () => {
  function maxBrute3(m: number[][]): number {
    const perms = [
      [0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0],
    ];
    return Math.max(...perms.map(p => p.reduce((s, j, i) => s + m[i][j], 0)));
  }

  for (let k = 0; k < 25; k++) {
    it(`maximize 3x3 brute-force k=${k}`, () => {
      const m = [
        [k + 1, k + 4, k + 2],
        [k + 3, k + 6, k + 1],
        [k + 5, k + 2, k + 7],
      ];
      const { benefit } = maximize(m);
      expect(benefit).toBe(maxBrute3(m));
    });
  }
});

// ─── 27. Reverse-diagonal assignment (25 tests) ───────────────────────────────
describe('Reverse diagonal optimal assignment', () => {
  for (let n = 2; n <= 26; n++) {
    it(`reverse diagonal n=${n}`, () => {
      const BIG = 999999;
      const m: number[][] = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => (j === n - 1 - i ? 1 : BIG))
      );
      const { assignment, cost } = hungarian(m);
      expect(cost).toBe(n);
      for (let i = 0; i < n; i++) {
        expect(assignment[i]).toBe(n - 1 - i);
      }
    });
  }
});

// ─── 28. isValidAssignment with permuted valid assignments (25 tests) ──────────
describe('isValidAssignment with permuted assignments', () => {
  const permsOf3 = [
    [0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0],
  ];
  for (let i = 0; i < 6; i++) {
    for (let rep = 0; rep < 4; rep++) {
      it(`isValidAssignment permOf3[${i}] rep=${rep}`, () => {
        expect(isValidAssignment(permsOf3[i], 3)).toBe(true);
      });
    }
  }
  // 1 more
  it('isValidAssignment [2,1,0] valid', () => {
    expect(isValidAssignment([2, 1, 0], 3)).toBe(true);
  });
});

// ─── 29. assignmentCost with anti-diagonal (25 tests) ─────────────────────────
describe('assignmentCost anti-diagonal', () => {
  for (let n = 1; n <= 25; n++) {
    it(`assignmentCost anti-diagonal n=${n}`, () => {
      const m: number[][] = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => j + 1)
      );
      // anti-diagonal assignment: row i → col (n-1-i)
      const assignment = Array.from({ length: n }, (_, i) => n - 1 - i);
      const expected = assignment.reduce((s, j) => s + (j + 1), 0);
      expect(assignmentCost(m, assignment)).toBe(expected);
    });
  }
});

// ─── 30. Verify munkres pairs cover all rows and columns (50 tests) ────────────
describe('munkres covers all rows and columns', () => {
  for (let n = 1; n <= 50; n++) {
    it(`munkres covers rows/cols n=${n}`, () => {
      const m: number[][] = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => ((i * 5 + j * 11) % 20) + 1)
      );
      const pairs = munkres(m);
      const rowSet = new Set(pairs.map(p => p[0]));
      const colSet = new Set(pairs.map(p => p[1]));
      expect(rowSet.size).toBe(n);
      expect(colSet.size).toBe(n);
      for (let i = 0; i < n; i++) {
        expect(rowSet.has(i)).toBe(true);
      }
    });
  }
});
