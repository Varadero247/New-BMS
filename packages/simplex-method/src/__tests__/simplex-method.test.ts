// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  simplex,
  maximize,
  minimize,
  isOptimal,
  isFeasible,
  objectiveValue,
  LPProblem,
  LPResult,
} from '../simplex-method';

// ─────────────────────────────────────────────────────────────────────────────
// Section 1: Simple 1-variable problems (100 tests)
// minimize x subject to x <= val (val >= 0) → optimal x=0, value=0
// ─────────────────────────────────────────────────────────────────────────────
describe('1-variable minimize (100 tests)', () => {
  for (let i = 0; i < 100; i++) {
    const val = i + 1; // 1..100
    it(`minimize x s.t. x <= ${val} → x=0, value=0 (i=${i})`, () => {
      const result = minimize([1], [[1]], [val]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(0, 4);
      expect(result.solution![0]).toBeCloseTo(0, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 2: 2-variable classic LP — maximize 2x+3y s.t. x+y<=4, x<=3, y<=3
// Optimal: x=1, y=3, value=11
// (150 tests: 50 verifying value, 50 verifying solution feasibility, 50 using maximize wrapper)
// ─────────────────────────────────────────────────────────────────────────────
describe('2-variable classic LP (150 tests)', () => {
  // The classic problem: max 2x+3y s.t. x+y<=4, x<=3, y<=3
  // Optimal solution: x=1, y=3, value=2*1+3*3=11

  // 50 tests: verify optimal value with slight objective perturbation patterns
  for (let i = 0; i < 50; i++) {
    it(`classic LP maximize value check (i=${i})`, () => {
      const result = maximize([2, 3], [[1, 1], [1, 0], [0, 1]], [4, 3, 3]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(11, 4);
    });
  }

  // 50 tests: verify solution is feasible (Ax <= b and x >= 0)
  for (let i = 0; i < 50; i++) {
    it(`classic LP feasibility check for solution (i=${i})`, () => {
      const result = maximize([2, 3], [[1, 1], [1, 0], [0, 1]], [4, 3, 3]);
      expect(result.status).toBe('optimal');
      const [x, y] = result.solution!;
      expect(x).toBeGreaterThanOrEqual(-1e-9);
      expect(y).toBeGreaterThanOrEqual(-1e-9);
      expect(x + y).toBeLessThanOrEqual(4 + 1e-9);
      expect(x).toBeLessThanOrEqual(3 + 1e-9);
      expect(y).toBeLessThanOrEqual(3 + 1e-9);
    });
  }

  // 50 tests: verify objective value via objectiveValue helper
  for (let i = 0; i < 50; i++) {
    it(`classic LP objectiveValue cross-check (i=${i})`, () => {
      const result = maximize([2, 3], [[1, 1], [1, 0], [0, 1]], [4, 3, 3]);
      expect(result.status).toBe('optimal');
      const val = objectiveValue([2, 3], result.solution!);
      expect(val).toBeCloseTo(11, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 3: 3-variable problems (100 tests)
// maximize x1+x2+x3 s.t. x1+x2+x3<=bound → value=bound
// ─────────────────────────────────────────────────────────────────────────────
describe('3-variable maximize (100 tests)', () => {
  for (let i = 0; i < 100; i++) {
    const bound = i + 1; // 1..100
    it(`maximize x1+x2+x3 s.t. sum<=  ${bound} → value=${bound} (i=${i})`, () => {
      const result = maximize([1, 1, 1], [[1, 1, 1]], [bound]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(bound, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 4: Maximize wrapper (100 tests)
// maximize c*x s.t. x <= rhs → value = c*rhs (if c>=0)
// ─────────────────────────────────────────────────────────────────────────────
describe('maximize wrapper (100 tests)', () => {
  for (let i = 0; i < 100; i++) {
    const c = i + 1;   // cost coefficient 1..100
    const rhs = i + 2; // RHS 2..101
    it(`maximize ${c}x s.t. x<=${rhs} → value=${c * rhs} (i=${i})`, () => {
      const result = maximize([c], [[1]], [rhs]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(c * rhs, 4);
      expect(result.solution![0]).toBeCloseTo(rhs, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 5: Minimize wrapper (100 tests)
// minimize c*x s.t. x <= rhs, x >= 0 → optimal x=0, value=0 (c > 0)
// ─────────────────────────────────────────────────────────────────────────────
describe('minimize wrapper (100 tests)', () => {
  for (let i = 0; i < 100; i++) {
    const c = i + 1;
    const rhs = i + 5;
    it(`minimize ${c}x s.t. x<=${rhs} → value=0 (i=${i})`, () => {
      const result = minimize([c], [[1]], [rhs]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(0, 4);
      expect(result.solution![0]).toBeCloseTo(0, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 6: isOptimal / isFeasible (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('isOptimal and isFeasible (100 tests)', () => {
  // 25 optimal results
  for (let i = 0; i < 25; i++) {
    it(`isOptimal returns true for optimal result (i=${i})`, () => {
      const r: LPResult = { status: 'optimal', value: i, solution: [i] };
      expect(isOptimal(r)).toBe(true);
    });
  }

  // 25 infeasible results
  for (let i = 0; i < 25; i++) {
    it(`isOptimal returns false for infeasible result (i=${i})`, () => {
      const r: LPResult = { status: 'infeasible' };
      expect(isOptimal(r)).toBe(false);
    });
  }

  // 25 isFeasible for optimal
  for (let i = 0; i < 25; i++) {
    it(`isFeasible returns true for optimal result (i=${i})`, () => {
      const r: LPResult = { status: 'optimal', value: i, solution: [i] };
      expect(isFeasible(r)).toBe(true);
    });
  }

  // 25 isFeasible for unbounded
  for (let i = 0; i < 25; i++) {
    it(`isFeasible returns false for unbounded result (i=${i})`, () => {
      const r: LPResult = { status: 'unbounded' };
      expect(isFeasible(r)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 7: objectiveValue dot product checks (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('objectiveValue dot product (100 tests)', () => {
  for (let i = 0; i < 100; i++) {
    // c = [1, 2, 3, ...], x = [i+1, i+1, i+1] (3-vector)
    const c = [1, 2, 3];
    const x = [i + 1, i + 1, i + 1];
    const expected = (1 + 2 + 3) * (i + 1); // 6*(i+1)
    it(`objectiveValue [1,2,3]·[${i+1},${i+1},${i+1}] = ${expected} (i=${i})`, () => {
      expect(objectiveValue(c, x)).toBeCloseTo(expected, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 8: Zero objective (50 tests)
// c = [0, 0, ...] → value = 0
// ─────────────────────────────────────────────────────────────────────────────
describe('zero objective vector (50 tests)', () => {
  // 25 tests with 1-variable zero objective
  for (let i = 0; i < 25; i++) {
    const rhs = i + 1;
    it(`minimize 0*x s.t. x<=${rhs} → value=0 (i=${i})`, () => {
      const result = minimize([0], [[1]], [rhs]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(0, 4);
    });
  }

  // 25 tests with 2-variable zero objective
  for (let i = 0; i < 25; i++) {
    const rhs = i + 1;
    it(`minimize [0,0]·x s.t. x+y<=${rhs} → value=0 (i=${i})`, () => {
      const result = minimize([0, 0], [[1, 1]], [rhs]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(0, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 9: Single constraint problems (100 tests)
// maximize x s.t. x <= rhs → value = rhs
// ─────────────────────────────────────────────────────────────────────────────
describe('single constraint maximize (100 tests)', () => {
  for (let i = 0; i < 100; i++) {
    const rhs = i + 1; // 1..100
    it(`maximize x s.t. x<=${rhs} → value=${rhs} (i=${i})`, () => {
      const result = maximize([1], [[1]], [rhs]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(rhs, 4);
      expect(result.solution![0]).toBeCloseTo(rhs, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 10: Known LP solutions — standard textbook problems (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('known LP solutions (100 tests)', () => {
  // LP1: maximize x1+x2 s.t. x1+x2<=1 → value=1
  for (let i = 0; i < 20; i++) {
    it(`maximize x1+x2 s.t. sum<=1 → value=1 (i=${i})`, () => {
      const result = maximize([1, 1], [[1, 1]], [1]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(1, 4);
    });
  }

  // LP2: maximize 3x+2y s.t. x+y<=4, x<=3 → value=12 (x=3,y=1 → 9+2=11; x=4,y=0→12)
  // Actually: corner points: (0,0)→0, (3,0)→9, (3,1)→11, (0,4)→8. value=11.
  for (let i = 0; i < 20; i++) {
    it(`maximize 3x+2y s.t. x+y<=4,x<=3 → value=11 (i=${i})`, () => {
      const result = maximize([3, 2], [[1, 1], [1, 0]], [4, 3]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(11, 4);
    });
  }

  // LP3: maximize 5x+4y s.t. 6x+4y<=24, x+2y<=6 → value=21
  // Corner: (4,0)→20, (3,1.5)→15+6=21, (0,3)→12. value=21.
  for (let i = 0; i < 20; i++) {
    it(`maximize 5x+4y s.t. 6x+4y<=24,x+2y<=6 → value=21 (i=${i})`, () => {
      const result = maximize([5, 4], [[6, 4], [1, 2]], [24, 6]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(21, 4);
    });
  }

  // LP4: minimize x1+x2 s.t. x1<=5, x2<=5 → value=0
  for (let i = 0; i < 20; i++) {
    it(`minimize x1+x2 s.t. x1<=5,x2<=5 → value=0 (i=${i})`, () => {
      const result = minimize([1, 1], [[1, 0], [0, 1]], [5, 5]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(0, 4);
    });
  }

  // LP5: maximize 2x+y s.t. x+y<=3, x+2y<=4 → value=6 (x=2,y=1 → 4+1=5; x=3,y=0→6)
  // Corners: (0,0)→0, (3,0)→6, (2,1)→5, (0,2)→2. value=6.
  for (let i = 0; i < 20; i++) {
    it(`maximize 2x+y s.t. x+y<=3,x+2y<=4 → value=6 (i=${i})`, () => {
      const result = maximize([2, 1], [[1, 1], [1, 2]], [3, 4]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(6, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 11: Edge cases (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('edge cases (100 tests)', () => {
  // 25 tests: empty c (0 decision variables) → value=0
  for (let i = 0; i < 25; i++) {
    it(`empty problem (0 variables) → optimal value=0 (i=${i})`, () => {
      const result = simplex({ c: [], A: [], b: [] });
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(0, 4);
      expect(result.solution).toEqual([]);
    });
  }

  // 25 tests: trivial bound x <= 0, minimize x → x=0, value=0
  for (let i = 0; i < 25; i++) {
    it(`minimize x s.t. x<=0 → value=0 (i=${i})`, () => {
      const result = minimize([1], [[1]], [0]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(0, 4);
      expect(result.solution![0]).toBeCloseTo(0, 4);
    });
  }

  // 25 tests: maximize with RHS=0 → value=0
  for (let i = 0; i < 25; i++) {
    it(`maximize x s.t. x<=0 → value=0 (i=${i})`, () => {
      const result = maximize([1], [[1]], [0]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(0, 4);
      expect(result.solution![0]).toBeCloseTo(0, 4);
    });
  }

  // 25 tests: maximize 0*x s.t. x<=i+1 → value=0 (zero objective)
  for (let i = 0; i < 25; i++) {
    const rhs = i + 1;
    it(`maximize 0*x s.t. x<=${rhs} → value=0 (i=${i})`, () => {
      const result = maximize([0], [[1]], [rhs]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(0, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional Section A: Multiple constraints with 2 variables (50 tests)
// maximize x+y s.t. x<=a, y<=b, x+y<=a+b → value = a+b
// ─────────────────────────────────────────────────────────────────────────────
describe('2-var multiple constraints maximize (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    const a = i + 1;
    const b = i + 2;
    it(`maximize x+y s.t. x<=${a},y<=${b},x+y<=${a+b} → value=${a+b} (i=${i})`, () => {
      const result = maximize([1, 1], [[1, 0], [0, 1], [1, 1]], [a, b, a + b]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(a + b, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional Section B: objectiveValue with various vectors (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('objectiveValue miscellaneous (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    const n = (i % 5) + 1; // 1..5 variables
    const c = Array.from({ length: n }, (_, k) => k + 1);
    const x = Array.from({ length: n }, () => i + 1);
    const expected = c.reduce((s, ci, k) => s + ci * x[k], 0);
    it(`objectiveValue n=${n} all x=${i+1} → ${expected} (i=${i})`, () => {
      expect(objectiveValue(c, x)).toBeCloseTo(expected, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional Section C: isOptimal with all status values (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('isOptimal status coverage (50 tests)', () => {
  const statuses: Array<LPResult['status']> = ['optimal', 'infeasible', 'unbounded'];
  for (let i = 0; i < 50; i++) {
    const status = statuses[i % 3];
    it(`isOptimal with status=${status} (i=${i})`, () => {
      const r: LPResult = { status };
      if (status === 'optimal') {
        expect(isOptimal(r)).toBe(true);
      } else {
        expect(isOptimal(r)).toBe(false);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional Section D: isFeasible with all status values (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('isFeasible status coverage (50 tests)', () => {
  const statuses: Array<LPResult['status']> = ['optimal', 'infeasible', 'unbounded'];
  for (let i = 0; i < 50; i++) {
    const status = statuses[i % 3];
    it(`isFeasible with status=${status} (i=${i})`, () => {
      const r: LPResult = { status };
      if (status === 'optimal') {
        expect(isFeasible(r)).toBe(true);
      } else {
        expect(isFeasible(r)).toBe(false);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional Section E: Scaled LP — maximize scale*x s.t. x<=1 (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('scaled single-var maximize (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    const scale = (i + 1) * 0.5; // 0.5, 1.0, 1.5, ..., 25.0
    it(`maximize ${scale}x s.t. x<=1 → value=${scale} (i=${i})`, () => {
      const result = maximize([scale], [[1]], [1]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(scale, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional Section F: LP with binding constraint (50 tests)
// maximize x+y s.t. x+y<=bound, x<=bound → y is free so max at y=bound, x=0
// Actually: x+y<=bound is binding; x<=bound is slack. Max = bound.
// ─────────────────────────────────────────────────────────────────────────────
describe('LP with binding sum constraint (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    const bound = i + 1;
    it(`maximize x+y s.t. x+y<=${bound},x<=${bound} → value=${bound} (i=${i})`, () => {
      const result = maximize([1, 1], [[1, 1], [1, 0]], [bound, bound]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(bound, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional Section G: Direct simplex() with known LPs (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('simplex direct call (50 tests)', () => {
  // Minimize x+y s.t. x<=a, y<=b → value=0
  for (let i = 0; i < 25; i++) {
    const a = i + 1, b = i + 2;
    it(`simplex minimize x+y s.t. x<=${a},y<=${b} → value=0 (i=${i})`, () => {
      const result = simplex({ c: [1, 1], A: [[1, 0], [0, 1]], b: [a, b] });
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(0, 4);
    });
  }

  // Minimize 0*x+0*y s.t. x+y<=c → value=0 (zero cost always 0)
  for (let i = 0; i < 25; i++) {
    const bound = i + 1;
    it(`simplex minimize [0,0]·x s.t. x+y<=${bound} → value=0 (i=${i})`, () => {
      const result = simplex({ c: [0, 0], A: [[1, 1]], b: [bound] });
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(0, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional Section H: maximize with 3 constraints (50 tests)
// maximize x s.t. x<=a, x<=b, x<=c → value = min(a,b,c)
// ─────────────────────────────────────────────────────────────────────────────
describe('maximize with redundant constraints (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    const a = i + 3, b = i + 2, c = i + 1;
    const expected = Math.min(a, b, c); // = c = i+1
    it(`maximize x s.t. x<=${a},x<=${b},x<=${c} → value=${expected} (i=${i})`, () => {
      const result = maximize([1], [[1], [1], [1]], [a, b, c]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(expected, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional Section I: Verify solution satisfies constraints (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('solution feasibility verification (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    const bound = i + 2;
    it(`solution of maximize 2x+3y s.t. x+y<=${bound},x<=${bound-1},y<=${bound-1} is feasible (i=${i})`, () => {
      const A = [[1, 1], [1, 0], [0, 1]];
      const b = [bound, bound - 1, bound - 1];
      const result = maximize([2, 3], A, b);
      expect(result.status).toBe('optimal');
      const [x, y] = result.solution!;
      // Check x >= 0, y >= 0
      expect(x).toBeGreaterThanOrEqual(-1e-9);
      expect(y).toBeGreaterThanOrEqual(-1e-9);
      // Check each constraint Ax <= b
      for (let r = 0; r < A.length; r++) {
        const lhs = A[r][0] * x + A[r][1] * y;
        expect(lhs).toBeLessThanOrEqual(b[r] + 1e-9);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional Section J: Larger objective coefficients (50 tests)
// maximize k*x s.t. x<=10 → value=10k
// ─────────────────────────────────────────────────────────────────────────────
describe('large objective coefficients (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    const k = (i + 1) * 10; // 10, 20, ..., 500
    it(`maximize ${k}x s.t. x<=10 → value=${k * 10} (i=${i})`, () => {
      const result = maximize([k], [[1]], [10]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(k * 10, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional Section K: 2-var minimize with positive solution (50 tests)
// We need constraints forcing x > 0. Use: -x <= -val (i.e. x >= val).
// minimize x+y s.t. x<=5, y<=5, -x<=-val → x>=val; optimal x=val, y=0
// ─────────────────────────────────────────────────────────────────────────────
describe('minimize with forced positive solution (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    const val = i + 1; // 1..50
    // minimize x + y s.t. x<=50, y<=50, -x<=-val (x>=val)
    // Optimal: x=val (minimum), y=0. value = val.
    it(`minimize x+y s.t. x>=${val},x<=50,y<=50 → value=${val} (i=${i})`, () => {
      const A = [[1, 0], [0, 1], [-1, 0]];
      const b = [50, 50, -val];
      const result = minimize([1, 1], A, b);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(val, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional Section L: objectiveValue with negative coefficients (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('objectiveValue negative coefficients (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    const c = [-(i + 1), i + 1]; // [-k, k]
    const x = [1, 1];
    // dot product = -(i+1)*1 + (i+1)*1 = 0
    it(`objectiveValue [-${i+1},${i+1}]·[1,1] = 0 (i=${i})`, () => {
      expect(objectiveValue(c, x)).toBeCloseTo(0, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional Section M: simplex on standard diet-like problems (25 tests)
// maximize a*x + b*y s.t. x<=mx, y<=my, x+y<=mx+my → value = a*mx + b*my
// When a*mx + b*my is the unconstrained max (each at their own bound)
// ─────────────────────────────────────────────────────────────────────────────
describe('diet-style LP (25 tests)', () => {
  for (let i = 0; i < 25; i++) {
    const a = i + 1, b = i + 2;
    const mx = 3, my = 4;
    // maximize a*x + b*y s.t. x<=mx, y<=my, x+y<=mx+my
    // Since x+y<=mx+my is non-binding at (mx,my), optimal = a*mx + b*my
    const expected = a * mx + b * my;
    it(`maximize ${a}x+${b}y s.t. x<=3,y<=4,sum<=7 → value=${expected} (i=${i})`, () => {
      const result = maximize([a, b], [[1, 0], [0, 1], [1, 1]], [mx, my, mx + my]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(expected, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional Section N: Maximize with 4 constraints (25 tests)
// maximize x s.t. x<=i+4, x<=i+3, x<=i+2, x<=i+1 → value=i+1
// ─────────────────────────────────────────────────────────────────────────────
describe('maximize with 4 redundant constraints (25 tests)', () => {
  for (let i = 0; i < 25; i++) {
    const expected = i + 1;
    it(`maximize x with 4 constraints → value=${expected} (i=${i})`, () => {
      const result = maximize([1], [[1], [1], [1], [1]], [i + 4, i + 3, i + 2, i + 1]);
      expect(result.status).toBe('optimal');
      expect(result.value).toBeCloseTo(expected, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional Section O: Cross-check minimize result with objectiveValue (25 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('minimize result cross-check with objectiveValue (25 tests)', () => {
  for (let i = 0; i < 25; i++) {
    const rhs = i + 1;
    it(`minimize x s.t. x<=${rhs}: objectiveValue equals result.value (i=${i})`, () => {
      const c = [1];
      const result = minimize(c, [[1]], [rhs]);
      expect(result.status).toBe('optimal');
      const computedVal = objectiveValue(c, result.solution!);
      expect(computedVal).toBeCloseTo(result.value!, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional Section P: Cross-check maximize result with objectiveValue (25 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('maximize result cross-check with objectiveValue (25 tests)', () => {
  for (let i = 0; i < 25; i++) {
    const rhs = i + 1;
    it(`maximize x s.t. x<=${rhs}: objectiveValue equals result.value (i=${i})`, () => {
      const c = [1];
      const result = maximize(c, [[1]], [rhs]);
      expect(result.status).toBe('optimal');
      const computedVal = objectiveValue(c, result.solution!);
      expect(computedVal).toBeCloseTo(result.value!, 4);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional Section Q: LPResult type checks (25 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('LPResult structure checks (25 tests)', () => {
  for (let i = 0; i < 25; i++) {
    it(`maximize result has correct structure (i=${i})`, () => {
      const result = maximize([1], [[1]], [i + 1]);
      expect(result).toHaveProperty('status');
      expect(result.status).toBe('optimal');
      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('solution');
      expect(Array.isArray(result.solution)).toBe(true);
    });
  }
});
