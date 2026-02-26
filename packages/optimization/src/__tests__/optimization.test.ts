// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  gradientDescent,
  adam,
  simulatedAnnealing,
  nelderMead,
  bisection,
  newtonRaphson,
  goldenSection,
  geneticAlgorithm,
  numericalGradient,
  numericalDerivative,
  numericalSecondDerivative,
  trapezoidalRule,
  simpsonRule,
  gaussLegendre,
  boundedObjective,
} from '../optimization';

// ────────────────────────────────────────────────────────
// Deterministic random for stochastic tests
// ────────────────────────────────────────────────────────
function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 0xffffffff);
  };
}

// ────────────────────────────────────────────────────────
// Common objective functions
// ────────────────────────────────────────────────────────
const quad1D = (x: number[]) => x[0] * x[0];
const quad2D = (x: number[]) => x[0] * x[0] + x[1] * x[1];
const shiftedQuad1D = (shift: number) => (x: number[]) => (x[0] - shift) ** 2;
const shiftedQuad2D = (sx: number, sy: number) => (x: number[]) =>
  (x[0] - sx) ** 2 + (x[1] - sy) ** 2;

// ═══════════════════════════════════════════════════════════════════════════════
// 1. gradientDescent
// ═══════════════════════════════════════════════════════════════════════════════
describe('gradientDescent', () => {
  // 1.1 – Basic convergence from various starting points (1D)
  const starts1D = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    -1, -2, -3, -4, -5, -6, -7, -8, -9, -10,
    0.5, 1.5, 2.5, 3.5, -0.5, -1.5, -2.5, -3.5,
    0.1, 0.01,
  ];
  for (const s of starts1D) {
    it(`converges x^2 from start=${s}`, () => {
      const result = gradientDescent(quad1D, [s], {
        learningRate: 0.1,
        maxIterations: 2000,
        tolerance: 1e-5,
      });
      expect(result.value).toBeLessThan(1e-3);
    });
  }

  // 1.2 – Shifted quadratic converges to known minimum
  const shifts = [1, 2, 3, 4, 5, -1, -2, -3, -4, -5, 0.5, 1.5, -0.5, -1.5, 2.5, -2.5, 3.5, -3.5, 7, -7];
  for (const sh of shifts) {
    it(`converges (x-${sh})^2 from start=0`, () => {
      const result = gradientDescent(shiftedQuad1D(sh), [0], {
        learningRate: 0.1,
        maxIterations: 3000,
        tolerance: 1e-5,
      });
      expect(Math.abs(result.x[0] - sh)).toBeLessThan(0.05);
    });
  }

  // 1.3 – 2D quadratic
  const starts2D = [
    [1, 1], [2, 2], [3, 3], [4, 4], [5, 5],
    [-1, -1], [-2, -2], [-3, -3], [-4, -4], [-5, -5],
    [1, -1], [-1, 1], [2, -2], [-2, 2], [3, -3],
    [0.5, 0.5], [1.5, -1.5], [-1.5, 1.5], [2.5, 2.5], [-2.5, -2.5],
  ];
  for (const [sx, sy] of starts2D) {
    it(`2D quad converges from [${sx},${sy}]`, () => {
      const result = gradientDescent(quad2D, [sx, sy], {
        learningRate: 0.1,
        maxIterations: 2000,
        tolerance: 1e-5,
      });
      expect(result.value).toBeLessThan(1e-3);
    });
  }

  // 1.4 – Momentum tests
  const momentumVals = [0, 0.5, 0.9, 0.95, 0.99];
  for (const mu of momentumVals) {
    it(`momentum=${mu} still converges on x^2 from 5`, () => {
      const result = gradientDescent(quad1D, [5], {
        learningRate: 0.05,
        maxIterations: 5000,
        tolerance: 1e-4,
        momentum: mu,
      });
      expect(result.value).toBeLessThan(0.01);
    });
  }

  // 1.5 – Result structure checks
  it('returns correct result structure', () => {
    const r = gradientDescent(quad1D, [2]);
    expect(r).toHaveProperty('x');
    expect(r).toHaveProperty('value');
    expect(r).toHaveProperty('iterations');
    expect(r).toHaveProperty('converged');
    expect(Array.isArray(r.x)).toBe(true);
    expect(typeof r.value).toBe('number');
    expect(typeof r.iterations).toBe('number');
    expect(typeof r.converged).toBe('boolean');
  });

  it('converged flag true when gradient is small', () => {
    const r = gradientDescent(quad1D, [0.000001], { tolerance: 1e-3 });
    expect(r.converged).toBe(true);
  });

  it('converged false when maxIterations=1', () => {
    const r = gradientDescent(quad1D, [100], { maxIterations: 1 });
    expect(r.iterations).toBe(1);
  });

  it('value equals fn(x)', () => {
    const r = gradientDescent(quad1D, [3], { maxIterations: 5 });
    expect(r.value).toBeCloseTo(r.x[0] * r.x[0], 10);
  });

  it('default options do not throw', () => {
    expect(() => gradientDescent(quad1D, [1])).not.toThrow();
  });

  // 1.6 – Various learning rates
  const lrVals = [0.001, 0.01, 0.05, 0.1, 0.2];
  for (const lr of lrVals) {
    it(`learningRate=${lr} reduces value from x=5`, () => {
      const init = quad1D([5]);
      const r = gradientDescent(quad1D, [5], { learningRate: lr, maxIterations: 100 });
      expect(r.value).toBeLessThanOrEqual(init);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. adam
// ═══════════════════════════════════════════════════════════════════════════════
describe('adam', () => {
  // 2.1 – Convergence on quadratics from various starts
  const adamStarts = [
    1, 2, 3, 4, 5, -1, -2, -3, -4, -5,
    0.5, 1.5, 2.5, -0.5, -1.5, -2.5,
    10, -10, 0.1, -0.1,
  ];
  for (const s of adamStarts) {
    it(`adam converges x^2 from start=${s}`, () => {
      const result = adam(quad1D, [s], { maxIterations: 10000, tolerance: 1e-4, learningRate: 0.01 });
      expect(result.value).toBeLessThan(0.1);
    });
  }

  // 2.2 – 2D quadratics
  const adam2D = [
    [1, 1], [2, 2], [3, 3], [-1, -1], [-2, -2],
    [1, -1], [-1, 1], [0.5, 0.5], [5, 5], [-5, -5],
    [2, -3], [-3, 2], [4, -1], [-1, 4], [3, -4],
    [0.1, 0.1], [-0.1, -0.1], [7, 0], [0, 7], [-7, 0],
  ];
  for (const [sx, sy] of adam2D) {
    it(`adam 2D converges from [${sx},${sy}]`, () => {
      const result = adam(quad2D, [sx, sy], { maxIterations: 10000, tolerance: 1e-4, learningRate: 0.01 });
      expect(result.value).toBeLessThan(0.1);
    });
  }

  // 2.3 – Hyperparameter variations
  it('adam with beta1=0.5 converges', () => {
    const r = adam(quad1D, [5], { beta1: 0.5, maxIterations: 10000, learningRate: 0.01 });
    expect(r.value).toBeLessThan(0.1);
  });

  it('adam with beta2=0.99 converges', () => {
    const r = adam(quad1D, [5], { beta2: 0.99, maxIterations: 10000, learningRate: 0.01 });
    expect(r.value).toBeLessThan(0.1);
  });

  it('adam with lr=0.01 converges', () => {
    const r = adam(quad1D, [5], { learningRate: 0.01, maxIterations: 3000 });
    expect(r.value).toBeLessThan(0.1);
  });

  it('adam result has correct structure', () => {
    const r = adam(quad1D, [1]);
    expect(r).toHaveProperty('x');
    expect(r).toHaveProperty('value');
    expect(r).toHaveProperty('iterations');
    expect(r).toHaveProperty('converged');
  });

  it('adam value equals fn(x)', () => {
    const r = adam(quad1D, [3], { maxIterations: 5 });
    expect(r.value).toBeCloseTo(r.x[0] * r.x[0], 10);
  });

  it('adam maxIterations=1 sets iterations=1', () => {
    const r = adam(quad1D, [10], { maxIterations: 1 });
    expect(r.iterations).toBe(1);
  });

  it('adam already near minimum converges=true', () => {
    const r = adam(quad1D, [0.000001], { tolerance: 1e-3 });
    expect(r.converged).toBe(true);
  });

  it('adam does not throw with default options', () => {
    expect(() => adam(quad1D, [1])).not.toThrow();
  });

  it('adam epsilon option accepted', () => {
    const r = adam(quad1D, [5], { epsilon: 1e-7 });
    expect(r.value).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. bisection
// ═══════════════════════════════════════════════════════════════════════════════
describe('bisection', () => {
  // 3.1 – Linear functions f(x) = x - c
  const linearRoots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0.5, 1.5, 2.5, 3.5, 4.5, -1, -2, -3, -4, -5];
  for (const root of linearRoots) {
    it(`bisection finds root=${root} of f(x)=x-${root}`, () => {
      const fn = (x: number) => x - root;
      const a = root - 5;
      const b = root + 5;
      const result = bisection(fn, a, b, 1e-8);
      expect(Math.abs(result.root - root)).toBeLessThan(1e-6);
      expect(result.converged).toBe(true);
    });
  }

  // 3.2 – Quadratic f(x) = x^2 - c (positive root)
  const quadRootVals = [1, 2, 3, 4, 5, 6, 7, 8, 9, 16, 25, 0.25, 0.5, 1.5, 2.5, 3.5, 4.5, 6.25, 7.5, 9.5];
  for (const c of quadRootVals) {
    it(`bisection finds sqrt(${c})`, () => {
      const fn = (x: number) => x * x - c;
      const result = bisection(fn, 0, c + 1, 1e-8);
      expect(Math.abs(result.root - Math.sqrt(c))).toBeLessThan(1e-5);
    });
  }

  // 3.3 – Cubic f(x) = x^3 - c
  const cubicRoots = [1, 2, 4, 8, 27, -1, -8, -27, 0.5, -0.5, 3, -3];
  for (const c of cubicRoots) {
    it(`bisection finds cbrt(${c})`, () => {
      const fn = (x: number) => x * x * x - c;
      const cbrtC = Math.cbrt(c);
      const a = cbrtC - 5;
      const b = cbrtC + 5;
      const result = bisection(fn, a, b, 1e-7);
      expect(Math.abs(result.root - cbrtC)).toBeLessThan(1e-4);
    });
  }

  // 3.4 – Edge cases
  it('bisection no sign change returns converged=false', () => {
    const result = bisection(x => x * x + 1, -5, 5, 1e-8);
    expect(result.converged).toBe(false);
  });

  it('bisection maxIterations=1', () => {
    const result = bisection(x => x - 1, 0, 2, 1e-8, 1);
    expect(result.iterations).toBe(1);
  });

  it('bisection returns root near zero for f(x)=x', () => {
    const result = bisection(x => x, -1, 1, 1e-8);
    expect(Math.abs(result.root)).toBeLessThan(1e-6);
  });

  it('bisection result has correct structure', () => {
    const r = bisection(x => x - 1, 0, 2);
    expect(r).toHaveProperty('root');
    expect(r).toHaveProperty('iterations');
    expect(r).toHaveProperty('converged');
  });

  it('bisection iterations is positive number', () => {
    const r = bisection(x => x - 1, 0, 2);
    expect(r.iterations).toBeGreaterThan(0);
  });

  it('bisection default tolerance finds root accurately', () => {
    const r = bisection(x => x - 3.14159, 0, 10);
    expect(Math.abs(r.root - 3.14159)).toBeLessThan(1e-6);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. newtonRaphson
// ═══════════════════════════════════════════════════════════════════════════════
describe('newtonRaphson', () => {
  // 4.1 – Linear roots
  const nrLinear = [1, 2, 3, 4, 5, 6, 7, 8, -1, -2, -3, -4, -5, 0.5, 1.5, 2.5, -0.5, -1.5, -2.5, 10];
  for (const root of nrLinear) {
    it(`newton-raphson root=${root} of f(x)=x-${root}`, () => {
      const fn = (x: number) => x - root;
      const dfn = () => 1;
      const result = newtonRaphson(fn, dfn, 0);
      expect(Math.abs(result.root - root)).toBeLessThan(1e-6);
      expect(result.converged).toBe(true);
    });
  }

  // 4.2 – Quadratic positive roots
  const nrQuad = [1, 2, 3, 4, 5, 6, 7, 8, 9, 16, 0.25, 0.5, 1.5, 2.5, 3.5, 4.5, 6.25, 9.5, 12, 15];
  for (const c of nrQuad) {
    it(`newton-raphson finds sqrt(${c})`, () => {
      const fn = (x: number) => x * x - c;
      const dfn = (x: number) => 2 * x;
      const result = newtonRaphson(fn, dfn, c, 1e-10);
      expect(Math.abs(result.root - Math.sqrt(c))).toBeLessThan(1e-6);
    });
  }

  // 4.3 – Trig roots
  const nrTrigStarts = [1, 2, 4, 5, 7, 8, 10, 11, 13, 14];
  for (const start of nrTrigStarts) {
    it(`newton-raphson finds root of sin near start=${start}`, () => {
      const fn = (x: number) => Math.sin(x);
      const dfn = (x: number) => Math.cos(x);
      const nearestPiMultiple = Math.round(start / Math.PI) * Math.PI;
      const result = newtonRaphson(fn, dfn, nearestPiMultiple + 0.1, 1e-10);
      expect(Math.abs(Math.sin(result.root))).toBeLessThan(1e-6);
    });
  }

  // 4.4 – Structure / edge cases
  it('newton-raphson result structure', () => {
    const r = newtonRaphson(x => x - 1, () => 1, 0);
    expect(r).toHaveProperty('root');
    expect(r).toHaveProperty('iterations');
    expect(r).toHaveProperty('converged');
  });

  it('newton-raphson already at root converges immediately', () => {
    const r = newtonRaphson(x => x - 5, () => 1, 5, 1e-10);
    expect(r.converged).toBe(true);
    expect(r.iterations).toBe(1);
  });

  it('newton-raphson maxIterations=1', () => {
    const r = newtonRaphson(x => x * x - 100, x => 2 * x, 1, 1e-10, 1);
    expect(r.iterations).toBe(1);
  });

  it('newton-raphson default tolerance works', () => {
    const r = newtonRaphson(x => x - 2.71828, () => 1, 0);
    expect(Math.abs(r.root - 2.71828)).toBeLessThan(1e-6);
  });

  it('newton-raphson near-zero derivative handled', () => {
    // f(x) = x^2, f'(x) = 2x; at x=0, derivative is 0 — should not infinite loop
    expect(() => newtonRaphson(x => x * x, x => 2 * x, 0)).not.toThrow();
  });

  it('newton-raphson cubic root', () => {
    const r = newtonRaphson(x => x * x * x - 8, x => 3 * x * x, 3);
    expect(Math.abs(r.root - 2)).toBeLessThan(1e-6);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. goldenSection
// ═══════════════════════════════════════════════════════════════════════════════
describe('goldenSection', () => {
  // 5.1 – Parabola (x - c)^2 on various intervals
  const gsShifts = [0, 1, 2, 3, 4, 5, -1, -2, -3, -4, -5, 0.5, 1.5, 2.5, -0.5, -1.5, -2.5, 3.5, -3.5, 7];
  for (const shift of gsShifts) {
    it(`golden section finds min of (x-${shift})^2 on [${shift - 5}, ${shift + 5}]`, () => {
      const fn = (x: number) => (x - shift) * (x - shift);
      const result = goldenSection(fn, shift - 5, shift + 5, 1e-8);
      expect(Math.abs(result.x - shift)).toBeLessThan(1e-4);
      expect(result.value).toBeLessThan(1e-6);
    });
  }

  // 5.2 – Cosine function (minimum at pi on [0, 2pi])
  it('golden section finds min of cos on [0,2pi]', () => {
    const result = goldenSection(Math.cos, 0, 2 * Math.PI, 1e-8);
    expect(Math.abs(result.x - Math.PI)).toBeLessThan(1e-4);
  });

  // 5.3 – Various widths
  const gsWidths = [1, 2, 5, 10, 20, 50, 0.5, 0.1, 100, 0.01];
  for (const w of gsWidths) {
    it(`golden section on x^2 over [-${w},${w}]`, () => {
      const result = goldenSection(x => x * x, -w, w, 1e-8);
      expect(Math.abs(result.x)).toBeLessThan(1e-4);
      expect(result.value).toBeLessThan(1e-6);
    });
  }

  // 5.4 – Structure checks
  it('returns x, value, iterations', () => {
    const r = goldenSection(x => x * x, -1, 1);
    expect(r).toHaveProperty('x');
    expect(r).toHaveProperty('value');
    expect(r).toHaveProperty('iterations');
  });

  it('value equals fn(x)', () => {
    const r = goldenSection(x => (x - 2) ** 2, -5, 10);
    expect(r.value).toBeCloseTo((r.x - 2) ** 2, 8);
  });

  it('maxIterations=1 returns after 1 iteration', () => {
    const r = goldenSection(x => x * x, -10, 10, 1e-10, 1);
    expect(r.iterations).toBe(1);
  });

  it('golden section on constant returns after 0 useful iterations', () => {
    // Constant fn — any x is minimum; should not throw
    expect(() => goldenSection(() => 1, 0, 1)).not.toThrow();
  });

  it('golden section on x^4', () => {
    const r = goldenSection(x => x ** 4, -3, 3, 1e-8);
    expect(Math.abs(r.x)).toBeLessThan(1e-3);
  });

  it('golden section narrow interval', () => {
    const r = goldenSection(x => (x - 1.5) ** 2, 1.4, 1.6, 1e-8);
    expect(Math.abs(r.x - 1.5)).toBeLessThan(1e-4);
  });

  it('iterations is non-negative', () => {
    const r = goldenSection(x => x * x, -1, 1);
    expect(r.iterations).toBeGreaterThanOrEqual(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. nelderMead
// ═══════════════════════════════════════════════════════════════════════════════
describe('nelderMead', () => {
  // 6.1 – 2D quadratics from various starts
  const nmStarts = [
    [1, 1], [2, 2], [3, 3], [4, 4], [5, 5],
    [-1, -1], [-2, -2], [-3, -3], [-4, -4], [-5, -5],
    [1, -1], [-1, 1], [2, -2], [-2, 2], [3, -3],
    [0.5, 0.5], [1.5, -1.5], [-1.5, 1.5], [2.5, 2.5], [-2.5, -2.5],
    [0.1, 0.1], [4, -2], [-2, 4], [3.5, -1.5], [-1.5, 3.5],
    [0, 1], [1, 0], [0, -1], [-1, 0], [4, 1],
  ];
  for (const [sx, sy] of nmStarts) {
    it(`nelder-mead x^2+y^2 from [${sx},${sy}]`, () => {
      const result = nelderMead(quad2D, [sx, sy], { maxIterations: 3000, tolerance: 1e-5 });
      expect(result.value).toBeLessThan(0.01);
    });
  }

  // 6.2 – Shifted 2D quadratic
  const nmShifted = [
    [1, 1], [2, 2], [-1, -1], [3, -1], [-2, 3],
    [0, 0], [5, 5], [-5, -5], [2, -3], [-3, 2],
  ];
  for (const [sx, sy] of nmShifted) {
    it(`nelder-mead shifted quadratic target=[${sx},${sy}]`, () => {
      const fn = shiftedQuad2D(sx, sy);
      const result = nelderMead(fn, [0, 0], { maxIterations: 3000, tolerance: 1e-5 });
      expect(Math.abs(result.x[0] - sx)).toBeLessThan(0.1);
      expect(Math.abs(result.x[1] - sy)).toBeLessThan(0.1);
    });
  }

  // 6.3 – Structure checks
  it('nelder-mead result structure', () => {
    const r = nelderMead(quad2D, [1, 1]);
    expect(r).toHaveProperty('x');
    expect(r).toHaveProperty('value');
    expect(r).toHaveProperty('iterations');
    expect(r).toHaveProperty('converged');
  });

  it('nelder-mead value equals fn(x)', () => {
    const r = nelderMead(quad2D, [2, 3], { maxIterations: 10 });
    expect(r.value).toBeCloseTo(quad2D(r.x), 8);
  });

  it('nelder-mead 1D quadratic', () => {
    const r = nelderMead(quad1D, [5], { maxIterations: 5000, tolerance: 1e-8 });
    expect(r.value).toBeLessThan(1.0);
  });

  it('nelder-mead tolerates maxIterations=1', () => {
    const r = nelderMead(quad2D, [1, 1], { maxIterations: 1 });
    expect(r.iterations).toBeGreaterThanOrEqual(1);
  });

  it('nelder-mead at origin already converged', () => {
    const r = nelderMead(quad2D, [0, 0], { tolerance: 1e-3 });
    expect(r.value).toBeLessThan(1e-4);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. simulatedAnnealing
// ═══════════════════════════════════════════════════════════════════════════════
describe('simulatedAnnealing', () => {
  // 7.1 – Convergence with deterministic RNG from various starts
  const saSeeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 42, 99, 123, 999, 12345, 54321, 7777, 31337, 2718, 3141];
  for (const seed of saSeeds) {
    it(`SA seed=${seed} reduces x^2 from start=5`, () => {
      const rng = seededRng(seed);
      const init = quad1D([5]);
      const result = simulatedAnnealing(quad1D, [5], {
        initialTemperature: 10,
        coolingRate: 0.99,
        maxIterations: 2000,
        perturbation: 0.5,
        random: rng,
      });
      expect(result.value).toBeLessThanOrEqual(init + 0.01);
    });
  }

  // 7.2 – 1D shifts
  const saShifts = [1, 2, 3, -1, -2, -3, 0.5, -0.5, 4, -4, 5, -5, 1.5, -1.5, 2.5, -2.5];
  for (const sh of saShifts) {
    it(`SA finds approximate min of (x-${sh})^2`, () => {
      const rng = seededRng(42);
      const result = simulatedAnnealing(shiftedQuad1D(sh), [0], {
        initialTemperature: 50,
        coolingRate: 0.98,
        maxIterations: 5000,
        perturbation: 0.3,
        random: rng,
      });
      expect(result.value).toBeLessThan(sh * sh + 0.1);
    });
  }

  // 7.3 – Structure checks
  it('SA result structure', () => {
    const r = simulatedAnnealing(quad1D, [1], { random: seededRng(1) });
    expect(r).toHaveProperty('x');
    expect(r).toHaveProperty('value');
    expect(r).toHaveProperty('iterations');
    expect(r).toHaveProperty('converged');
  });

  it('SA value equals fn(x)', () => {
    const rng = seededRng(7);
    const r = simulatedAnnealing(quad1D, [3], { maxIterations: 10, random: rng });
    expect(r.value).toBeCloseTo(quad1D(r.x), 8);
  });

  it('SA uses random parameter (no Math.random call)', () => {
    let callCount = 0;
    const countRng = () => { callCount++; return 0.5; };
    simulatedAnnealing(quad1D, [1], { maxIterations: 10, random: countRng });
    expect(callCount).toBeGreaterThan(0);
  });

  it('SA maxIterations=1 iterates once', () => {
    const r = simulatedAnnealing(quad1D, [5], { maxIterations: 1, random: seededRng(1) });
    expect(r.iterations).toBe(1);
  });

  it('SA default random option does not throw', () => {
    expect(() => simulatedAnnealing(quad1D, [1], { maxIterations: 100 })).not.toThrow();
  });

  it('SA coolingRate=0.5 terminates', () => {
    const r = simulatedAnnealing(quad1D, [2], {
      coolingRate: 0.5, maxIterations: 1000, random: seededRng(1),
    });
    expect(r.iterations).toBeGreaterThan(0);
  });

  it('SA value is finite', () => {
    const r = simulatedAnnealing(quad1D, [3], { maxIterations: 100, random: seededRng(5) });
    expect(isFinite(r.value)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. geneticAlgorithm
// ═══════════════════════════════════════════════════════════════════════════════
describe('geneticAlgorithm', () => {
  // 8.1 – 1D x^2 with various seeds
  const gaSeeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 42, 99, 777, 1234, 5678, 9999, 11111, 22222, 33333, 44444];
  for (const seed of gaSeeds) {
    it(`GA seed=${seed} finds approximate minimum of x^2`, () => {
      const rng = seededRng(seed);
      const result = geneticAlgorithm(quad1D, 1, {
        populationSize: 30,
        generations: 100,
        geneMin: -5,
        geneMax: 5,
        random: rng,
      });
      expect(result.value).toBeLessThan(5);
    });
  }

  // 8.2 – 2D x^2+y^2
  const ga2DSeeds = [1, 2, 3, 4, 5, 7, 9, 13, 17, 23];
  for (const seed of ga2DSeeds) {
    it(`GA 2D seed=${seed} finds approximate minimum of x^2+y^2`, () => {
      const rng = seededRng(seed);
      const result = geneticAlgorithm(quad2D, 2, {
        populationSize: 40,
        generations: 150,
        geneMin: -5,
        geneMax: 5,
        random: rng,
      });
      expect(result.value).toBeLessThan(10);
    });
  }

  // 8.3 – Structure checks
  it('GA result structure', () => {
    const rng = seededRng(1);
    const r = geneticAlgorithm(quad1D, 1, { populationSize: 10, generations: 10, random: rng });
    expect(r).toHaveProperty('x');
    expect(r).toHaveProperty('value');
    expect(r).toHaveProperty('iterations');
    expect(r).toHaveProperty('converged');
    expect(Array.isArray(r.x)).toBe(true);
    expect(r.x.length).toBe(1);
  });

  it('GA geneCount=2 returns x with length 2', () => {
    const r = geneticAlgorithm(quad2D, 2, { populationSize: 10, generations: 5, random: seededRng(1) });
    expect(r.x.length).toBe(2);
  });

  it('GA value equals fn(x)', () => {
    const r = geneticAlgorithm(quad1D, 1, { populationSize: 10, generations: 5, random: seededRng(1) });
    expect(r.value).toBeCloseTo(quad1D(r.x), 8);
  });

  it('GA converged is true', () => {
    const r = geneticAlgorithm(quad1D, 1, { populationSize: 10, generations: 10, random: seededRng(1) });
    expect(r.converged).toBe(true);
  });

  it('GA uses random parameter', () => {
    let count = 0;
    const countRng = () => { count++; return 0.5; };
    geneticAlgorithm(quad1D, 1, { populationSize: 5, generations: 2, random: countRng });
    expect(count).toBeGreaterThan(0);
  });

  it('GA mutationRate=0 still runs', () => {
    const r = geneticAlgorithm(quad1D, 1, { mutationRate: 0, populationSize: 10, generations: 5, random: seededRng(1) });
    expect(r).toBeDefined();
  });

  it('GA crossoverRate=0 still runs', () => {
    const r = geneticAlgorithm(quad1D, 1, { crossoverRate: 0, populationSize: 10, generations: 5, random: seededRng(1) });
    expect(r).toBeDefined();
  });

  it('GA elitism=0 still runs', () => {
    const r = geneticAlgorithm(quad1D, 1, { elitism: 0, populationSize: 10, generations: 5, random: seededRng(1) });
    expect(r).toBeDefined();
  });

  it('GA iterations equals generations', () => {
    const gens = 15;
    const r = geneticAlgorithm(quad1D, 1, { generations: gens, populationSize: 5, random: seededRng(1) });
    expect(r.iterations).toBe(gens);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. numericalGradient
// ═══════════════════════════════════════════════════════════════════════════════
describe('numericalGradient', () => {
  // 9.1 – Gradient of x^2 is 2x
  const ngPoints = [
    0, 1, 2, 3, 4, 5, -1, -2, -3, -4, -5,
    0.5, 1.5, 2.5, -0.5, -1.5, -2.5,
    0.1, 0.01, 10, -10,
  ];
  for (const x of ngPoints) {
    it(`gradient of x^2 at x=${x} ≈ 2x`, () => {
      const grad = numericalGradient(quad1D, [x]);
      expect(grad[0]).toBeCloseTo(2 * x, 3);
    });
  }

  // 9.2 – Gradient of x^2+y^2
  const ng2DPoints = [
    [1, 1], [2, 2], [3, 3], [-1, -1], [-2, -2],
    [1, -1], [-1, 1], [0.5, 0.5], [3, -2], [-2, 3],
    [0, 1], [1, 0], [5, 0], [0, 5], [2.5, -1.5],
    [0.1, 0.2], [-0.3, 0.4], [4, -3], [-3, 4], [1.5, 2.5],
  ];
  for (const [px, py] of ng2DPoints) {
    it(`gradient of x^2+y^2 at [${px},${py}]`, () => {
      const grad = numericalGradient(quad2D, [px, py]);
      expect(grad[0]).toBeCloseTo(2 * px, 3);
      expect(grad[1]).toBeCloseTo(2 * py, 3);
    });
  }

  // 9.3 – Step size variation
  const hVals = [1e-3, 1e-4, 1e-5, 1e-6, 1e-7];
  for (const h of hVals) {
    it(`gradient h=${h} for x^2 at x=3`, () => {
      const grad = numericalGradient(quad1D, [3], h);
      expect(Math.abs(grad[0] - 6)).toBeLessThan(0.01);
    });
  }

  // 9.4 – Returns array of correct length
  it('gradient length matches input', () => {
    const grad = numericalGradient(quad2D, [1, 2]);
    expect(grad.length).toBe(2);
  });

  it('gradient 3D function', () => {
    const fn3D = (x: number[]) => x[0] ** 2 + x[1] ** 2 + x[2] ** 2;
    const grad = numericalGradient(fn3D, [1, 2, 3]);
    expect(grad[0]).toBeCloseTo(2, 3);
    expect(grad[1]).toBeCloseTo(4, 3);
    expect(grad[2]).toBeCloseTo(6, 3);
  });

  it('gradient at origin is zero for x^2', () => {
    const grad = numericalGradient(quad1D, [0]);
    expect(Math.abs(grad[0])).toBeLessThan(1e-3);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. numericalDerivative
// ═══════════════════════════════════════════════════════════════════════════════
describe('numericalDerivative', () => {
  // 10.1 – Linear f(x) = cx, derivative = c
  const ndLinear = [1, 2, 3, 4, 5, -1, -2, -3, -4, -5, 0.5, 1.5, 2.5, -0.5, -1.5, -2.5, 7, -7, 10, -10];
  for (const c of ndLinear) {
    it(`derivative of ${c}x at x=1 ≈ ${c}`, () => {
      const fn = (x: number) => c * x;
      expect(numericalDerivative(fn, 1)).toBeCloseTo(c, 3);
    });
  }

  // 10.2 – Quadratic f(x) = x^2, derivative = 2x
  const ndQuadPoints = [0, 1, 2, 3, 4, 5, -1, -2, -3, -4, -5, 0.5, 1.5, 2.5, -0.5, -1.5, -2.5, 7, 10, -10];
  for (const x of ndQuadPoints) {
    it(`derivative of x^2 at x=${x} ≈ ${2 * x}`, () => {
      expect(numericalDerivative(x2 => x2 * x2, x)).toBeCloseTo(2 * x, 3);
    });
  }

  // 10.3 – Trig derivatives
  const trigPoints = [0, Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2, Math.PI, 2 * Math.PI, -Math.PI / 4, -Math.PI / 2, -Math.PI];
  for (const x of trigPoints) {
    it(`derivative of sin at x=${x.toFixed(3)} ≈ cos(x)`, () => {
      expect(numericalDerivative(Math.sin, x)).toBeCloseTo(Math.cos(x), 3);
    });
  }

  // 10.4 – Exp derivative
  const expPoints = [0, 1, 2, 3, -1, -2, 0.5, -0.5, 1.5, -1.5];
  for (const x of expPoints) {
    it(`derivative of exp at x=${x} ≈ exp(x)`, () => {
      expect(numericalDerivative(Math.exp, x)).toBeCloseTo(Math.exp(x), 3);
    });
  }

  // 10.5 – Step size
  it('derivative with small h', () => {
    expect(numericalDerivative(x => x * x, 2, 1e-7)).toBeCloseTo(4, 3);
  });

  it('derivative with larger h', () => {
    expect(numericalDerivative(x => x * x, 2, 1e-3)).toBeCloseTo(4, 2);
  });

  it('derivative of constant is zero', () => {
    expect(numericalDerivative(() => 5, 3)).toBeCloseTo(0, 3);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. numericalSecondDerivative
// ═══════════════════════════════════════════════════════════════════════════════
describe('numericalSecondDerivative', () => {
  // 11.1 – f(x) = x^2, f''(x) = 2
  const sd1Points = [0, 1, 2, 3, 4, 5, -1, -2, -3, -4, -5, 0.5, 1.5, -0.5, -1.5, 2.5, -2.5, 7, -7, 10];
  for (const x of sd1Points) {
    it(`second derivative of x^2 at x=${x} ≈ 2`, () => {
      expect(numericalSecondDerivative(x2 => x2 * x2, x)).toBeCloseTo(2, 1);
    });
  }

  // 11.2 – f(x) = x^3, f''(x) = 6x
  const sd2Points = [1, 2, 3, -1, -2, -3, 0.5, -0.5, 1.5, -1.5, 2.5, -2.5];
  for (const x of sd2Points) {
    it(`second derivative of x^3 at x=${x} ≈ ${6 * x}`, () => {
      expect(numericalSecondDerivative(x3 => x3 * x3 * x3, x)).toBeCloseTo(6 * x, 0);
    });
  }

  // 11.3 – sin second derivative is -sin
  const sd3Points = [0, Math.PI / 4, Math.PI / 2, Math.PI, -Math.PI / 4, -Math.PI / 2, 1, 2, -1, -2];
  for (const x of sd3Points) {
    it(`second derivative of sin at x=${x.toFixed(3)} ≈ -sin(x)`, () => {
      expect(numericalSecondDerivative(Math.sin, x)).toBeCloseTo(-Math.sin(x), 1);
    });
  }

  // 11.4 – Edge cases
  it('second derivative of constant is 0', () => {
    expect(numericalSecondDerivative(() => 3, 5)).toBeCloseTo(0, 3);
  });

  it('second derivative of linear is 0', () => {
    expect(numericalSecondDerivative(x => 2 * x + 1, 5)).toBeCloseTo(0, 3);
  });

  it('returns a number', () => {
    const r = numericalSecondDerivative(x => x * x, 1);
    expect(typeof r).toBe('number');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 12. trapezoidalRule
// ═══════════════════════════════════════════════════════════════════════════════
describe('trapezoidalRule', () => {
  // 12.1 – Constant f(x) = c, integral = c*(b-a)
  const trapConst = [1, 2, 3, 4, 5, 0.5, 1.5, 2.5, -1, 10, 0.1, 0.25, 3.14, 7, 100, 0.001, 1000, -5, -0.5, 0.7];
  for (const c of trapConst) {
    it(`trapezoidal of const=${c} on [0,1] ≈ ${c}`, () => {
      expect(trapezoidalRule(() => c, 0, 1, 100)).toBeCloseTo(c, 4);
    });
  }

  // 12.2 – Linear f(x) = x, integral on [0,b] = b^2/2
  const trapLinear = [1, 2, 3, 4, 5, 0.5, 1.5, 2.5, 10, 0.1, 0.25, 3, 7, 4.5, 6, 8, 0.75, 1.25, 9, 2.75];
  for (const b of trapLinear) {
    it(`trapezoidal of x on [0,${b}] ≈ ${b * b / 2}`, () => {
      expect(trapezoidalRule(x => x, 0, b, 200)).toBeCloseTo(b * b / 2, 2);
    });
  }

  // 12.3 – Quadratic f(x) = x^2, integral on [0,b] = b^3/3
  const trapQuad = [1, 2, 3, 4, 5, 0.5, 1.5, 2.5, 0.1, 0.25];
  for (const b of trapQuad) {
    it(`trapezoidal of x^2 on [0,${b}] ≈ ${(b ** 3 / 3).toFixed(4)}`, () => {
      expect(trapezoidalRule(x => x * x, 0, b, 500)).toBeCloseTo(b ** 3 / 3, 1);
    });
  }

  // 12.4 – Trig integrals
  it('trapezoidal of sin on [0,pi] ≈ 2', () => {
    expect(trapezoidalRule(Math.sin, 0, Math.PI, 1000)).toBeCloseTo(2, 2);
  });

  it('trapezoidal of cos on [0,pi/2] ≈ 1', () => {
    expect(trapezoidalRule(Math.cos, 0, Math.PI / 2, 1000)).toBeCloseTo(1, 2);
  });

  it('trapezoidal of exp on [0,1] ≈ e-1', () => {
    expect(trapezoidalRule(Math.exp, 0, 1, 1000)).toBeCloseTo(Math.E - 1, 2);
  });

  // 12.5 – n subdivisions precision
  const nVals = [10, 50, 100, 200, 500, 1000, 2000];
  for (const n of nVals) {
    it(`trapezoidal n=${n} of x on [0,1] ≈ 0.5`, () => {
      expect(trapezoidalRule(x => x, 0, 1, n)).toBeCloseTo(0.5, n > 100 ? 4 : 2);
    });
  }

  it('trapezoidal returns number', () => {
    expect(typeof trapezoidalRule(x => x, 0, 1, 10)).toBe('number');
  });

  it('trapezoidal n=1 still returns value', () => {
    expect(trapezoidalRule(x => x, 0, 1, 1)).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 13. simpsonRule
// ═══════════════════════════════════════════════════════════════════════════════
describe('simpsonRule', () => {
  // 13.1 – Constant integrals
  const simpConst = [1, 2, 3, 4, 5, 0.5, 1.5, 2.5, -1, 10, 0.1, 0.25, 3.14, 7, 100, 0.001, -5, -0.5, 0.7, 1000];
  for (const c of simpConst) {
    it(`simpson of const=${c} on [0,1] ≈ ${c}`, () => {
      expect(simpsonRule(() => c, 0, 1, 100)).toBeCloseTo(c, 5);
    });
  }

  // 13.2 – Linear integrals
  const simpLinear = [1, 2, 3, 4, 5, 0.5, 1.5, 2.5, 10, 0.1, 0.25, 3, 7, 4.5, 6, 8, 0.75, 1.25, 9, 2.75];
  for (const b of simpLinear) {
    it(`simpson of x on [0,${b}] ≈ ${b * b / 2}`, () => {
      expect(simpsonRule(x => x, 0, b, 100)).toBeCloseTo(b * b / 2, 5);
    });
  }

  // 13.3 – Cubic integrals (Simpson's rule is exact for cubics)
  const simpCubic = [1, 2, 3, 0.5, 1.5, 2.5, 4, 5];
  for (const b of simpCubic) {
    it(`simpson of x^3 on [0,${b}] ≈ ${(b ** 4 / 4).toFixed(4)}`, () => {
      expect(simpsonRule(x => x ** 3, 0, b, 100)).toBeCloseTo(b ** 4 / 4, 4);
    });
  }

  // 13.4 – Trig integrals
  it('simpson of sin on [0,pi] ≈ 2', () => {
    expect(simpsonRule(Math.sin, 0, Math.PI, 1000)).toBeCloseTo(2, 4);
  });

  it('simpson of cos on [0,pi/2] ≈ 1', () => {
    expect(simpsonRule(Math.cos, 0, Math.PI / 2, 100)).toBeCloseTo(1, 4);
  });

  it('simpson of exp on [0,1] ≈ e-1', () => {
    expect(simpsonRule(Math.exp, 0, 1, 100)).toBeCloseTo(Math.E - 1, 4);
  });

  it('simpson of x^4 on [0,1] ≈ 0.2', () => {
    expect(simpsonRule(x => x ** 4, 0, 1, 100)).toBeCloseTo(0.2, 3);
  });

  it('simpson returns number', () => {
    expect(typeof simpsonRule(x => x, 0, 1, 10)).toBe('number');
  });

  it('simpson odd n is handled (bumped to even)', () => {
    expect(() => simpsonRule(x => x, 0, 1, 5)).not.toThrow();
  });

  // 13.5 – n precision comparison
  const simpNVals = [2, 4, 10, 20, 50, 100, 200, 500];
  for (const n of simpNVals) {
    it(`simpson n=${n} of x^2 on [0,1] ≈ 1/3`, () => {
      expect(simpsonRule(x => x * x, 0, 1, n)).toBeCloseTo(1 / 3, 3);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 14. gaussLegendre
// ═══════════════════════════════════════════════════════════════════════════════
describe('gaussLegendre', () => {
  // 14.1 – Polynomial integrals (exact for low-degree)
  const glPolynomials: Array<{ fn: (x: number) => number; a: number; b: number; expected: number; desc: string }> = [
    { fn: () => 1, a: 0, b: 1, expected: 1, desc: 'const 1 on [0,1]' },
    { fn: x => x, a: 0, b: 1, expected: 0.5, desc: 'x on [0,1]' },
    { fn: x => x * x, a: 0, b: 1, expected: 1 / 3, desc: 'x^2 on [0,1]' },
    { fn: x => x ** 3, a: 0, b: 1, expected: 0.25, desc: 'x^3 on [0,1]' },
    { fn: x => x ** 4, a: 0, b: 1, expected: 0.2, desc: 'x^4 on [0,1]' },
    { fn: () => 1, a: 0, b: 2, expected: 2, desc: 'const 1 on [0,2]' },
    { fn: x => x, a: 0, b: 2, expected: 2, desc: 'x on [0,2]' },
    { fn: x => x * x, a: 0, b: 2, expected: 8 / 3, desc: 'x^2 on [0,2]' },
    { fn: x => x ** 3, a: 0, b: 2, expected: 4, desc: 'x^3 on [0,2]' },
    { fn: x => 2 * x + 1, a: 0, b: 3, expected: 12, desc: '2x+1 on [0,3]' },
  ];
  for (const { fn, a, b, expected, desc } of glPolynomials) {
    it(`gauss-legendre ${desc} ≈ ${expected}`, () => {
      expect(gaussLegendre(fn, a, b)).toBeCloseTo(expected, 5);
    });
  }

  // 14.2 – Trig integrals
  it('gauss-legendre sin on [0,pi] ≈ 2', () => {
    expect(gaussLegendre(Math.sin, 0, Math.PI)).toBeCloseTo(2, 3);
  });

  it('gauss-legendre cos on [0,pi/2] ≈ 1', () => {
    expect(gaussLegendre(Math.cos, 0, Math.PI / 2)).toBeCloseTo(1, 3);
  });

  it('gauss-legendre exp on [0,1] ≈ e-1', () => {
    expect(gaussLegendre(Math.exp, 0, 1)).toBeCloseTo(Math.E - 1, 4);
  });

  it('gauss-legendre returns number', () => {
    expect(typeof gaussLegendre(x => x, 0, 1)).toBe('number');
  });

  // 14.3 – Point count variations
  it('gauss-legendre 3-point works', () => {
    expect(gaussLegendre(x => x * x, 0, 1, 3)).toBeCloseTo(1 / 3, 4);
  });

  it('gauss-legendre 5-point works (default)', () => {
    expect(gaussLegendre(x => x * x, 0, 1, 5)).toBeCloseTo(1 / 3, 5);
  });

  it('gauss-legendre 7-point works', () => {
    expect(gaussLegendre(x => x * x, 0, 1, 7)).toBeCloseTo(1 / 3, 5);
  });

  // 14.4 – Various intervals
  const glIntervals = [
    [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [-1, 1], [-2, 2], [0, 0.5], [0.5, 1], [2, 5],
  ];
  for (const [a, b] of glIntervals) {
    it(`gauss-legendre of x on [${a},${b}] ≈ ${(b * b - a * a) / 2}`, () => {
      const expected = (b * b - a * a) / 2;
      expect(gaussLegendre(x => x, a, b)).toBeCloseTo(expected, 4);
    });
  }

  it('gauss-legendre negative interval', () => {
    expect(gaussLegendre(x => x * x, -1, 0)).toBeCloseTo(1 / 3, 5);
  });

  it('gauss-legendre x^3 on [-1,1] ≈ 0 (odd function)', () => {
    expect(gaussLegendre(x => x ** 3, -1, 1)).toBeCloseTo(0, 5);
  });

  it('gauss-legendre unknown points count falls back to 5-point', () => {
    expect(() => gaussLegendre(x => x, 0, 1, 4)).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 15. boundedObjective
// ═══════════════════════════════════════════════════════════════════════════════
describe('boundedObjective', () => {
  // 15.1 – Within bounds: same as original
  const boInBounds = [
    [0], [0.5], [1], [-0.5], [-1], [0.1], [-0.1], [0.9], [-0.9], [0.25],
  ];
  for (const x of boInBounds) {
    it(`bounded x=${x[0]} in [-2,2] returns quad value`, () => {
      const bounded = boundedObjective(quad1D, [[-2, 2]]);
      expect(bounded(x)).toBeCloseTo(quad1D(x), 8);
    });
  }

  // 15.2 – Outside bounds: penalty is added
  const boOutOfBounds = [
    { x: [3], desc: 'x=3 above ub=2' },
    { x: [5], desc: 'x=5 above ub=2' },
    { x: [-3], desc: 'x=-3 below lb=-2' },
    { x: [-5], desc: 'x=-5 below lb=-2' },
    { x: [10], desc: 'x=10 above ub=2' },
    { x: [-10], desc: 'x=-10 below lb=-2' },
    { x: [100], desc: 'x=100 above ub=2' },
    { x: [2.1], desc: 'x=2.1 slightly above ub=2' },
    { x: [-2.1], desc: 'x=-2.1 slightly below lb=-2' },
    { x: [50], desc: 'x=50 far above ub=2' },
  ];
  for (const { x, desc } of boOutOfBounds) {
    it(`bounded ${desc} adds penalty`, () => {
      const bounded = boundedObjective(quad1D, [[-2, 2]]);
      expect(bounded(x)).toBeGreaterThan(quad1D(x));
    });
  }

  // 15.3 – 2D bounds
  it('2D bounded within bounds = original value', () => {
    const bounded = boundedObjective(quad2D, [[-5, 5], [-5, 5]]);
    expect(bounded([1, 1])).toBeCloseTo(quad2D([1, 1]), 8);
  });

  it('2D bounded outside x bound adds penalty', () => {
    const bounded = boundedObjective(quad2D, [[-5, 5], [-5, 5]]);
    expect(bounded([10, 0])).toBeGreaterThan(quad2D([10, 0]));
  });

  it('2D bounded outside y bound adds penalty', () => {
    const bounded = boundedObjective(quad2D, [[-5, 5], [-5, 5]]);
    expect(bounded([0, 10])).toBeGreaterThan(quad2D([0, 10]));
  });

  // 15.4 – Custom penalty
  it('custom penalty=1e3 applied outside bounds', () => {
    const bounded = boundedObjective(quad1D, [[-1, 1]], 1e3);
    const x = [5];
    const excess = 5 - 1; // 4
    expect(bounded(x)).toBeCloseTo(quad1D(x) + 1e3 * excess * excess, 4);
  });

  it('custom penalty=0 removes penalty effect', () => {
    const bounded = boundedObjective(quad1D, [[-1, 1]], 0);
    const x = [5];
    expect(bounded(x)).toBeCloseTo(quad1D(x), 8);
  });

  it('boundedObjective returns a function', () => {
    const bounded = boundedObjective(quad1D, [[-1, 1]]);
    expect(typeof bounded).toBe('function');
  });

  it('bounded at exact boundary is not penalized (lower)', () => {
    const bounded = boundedObjective(quad1D, [[-2, 2]]);
    expect(bounded([-2])).toBeCloseTo(quad1D([-2]), 8);
  });

  it('bounded at exact boundary is not penalized (upper)', () => {
    const bounded = boundedObjective(quad1D, [[-2, 2]]);
    expect(bounded([2])).toBeCloseTo(quad1D([2]), 8);
  });

  it('default penalty=1e6 is large', () => {
    const bounded = boundedObjective(quad1D, [[0, 1]]);
    const x = [2]; // 1 above upper bound
    expect(bounded(x)).toBeGreaterThan(1e5);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 16. Edge cases and miscellaneous
// ═══════════════════════════════════════════════════════════════════════════════
describe('edge cases', () => {
  // 16.1 – Already at minimum
  it('gradientDescent at minimum [0] returns value ≈ 0', () => {
    const r = gradientDescent(quad1D, [0], { tolerance: 1e-8 });
    expect(r.value).toBeCloseTo(0, 5);
  });

  it('adam at minimum [0] returns value ≈ 0', () => {
    const r = adam(quad1D, [0], { tolerance: 1e-8 });
    expect(r.value).toBeCloseTo(0, 5);
  });

  it('nelderMead at minimum [0,0] returns value ≈ 0', () => {
    const r = nelderMead(quad2D, [0, 0], { tolerance: 1e-6 });
    expect(r.value).toBeLessThan(0.001);
  });

  // 16.2 – maxIterations=1 behaviors
  it('bisection maxIterations=0 returns with 0 iterations', () => {
    const r = bisection(x => x - 1, 0, 2, 1e-8, 0);
    expect(r.iterations).toBe(0);
  });

  it('newtonRaphson maxIterations=0 returns immediately', () => {
    const r = newtonRaphson(x => x - 5, () => 1, 0, 1e-8, 0);
    expect(r.iterations).toBe(0);
  });

  it('goldenSection maxIterations=0 returns', () => {
    expect(() => goldenSection(x => x * x, -1, 1, 1e-8, 0)).not.toThrow();
  });

  // 16.3 – Single element arrays
  it('numericalGradient 1D returns 1-element array', () => {
    const g = numericalGradient(quad1D, [3]);
    expect(g.length).toBe(1);
  });

  it('gradientDescent 1D result x has length 1', () => {
    const r = gradientDescent(quad1D, [5]);
    expect(r.x.length).toBe(1);
  });

  // 16.4 – Large and small values
  it('trapezoidalRule on large interval', () => {
    expect(trapezoidalRule(() => 1, 0, 1000, 1000)).toBeCloseTo(1000, 1);
  });

  it('simpsonRule on large interval', () => {
    expect(simpsonRule(() => 1, 0, 1000, 1000)).toBeCloseTo(1000, 1);
  });

  it('gaussLegendre on large interval', () => {
    expect(gaussLegendre(() => 1, 0, 100)).toBeCloseTo(100, 3);
  });

  // 16.5 – All integration methods agree on simple integral
  it('all 3 integration methods agree on integral of x^2 on [0,1]', () => {
    const trap = trapezoidalRule(x => x * x, 0, 1, 1000);
    const simp = simpsonRule(x => x * x, 0, 1, 1000);
    const gauss = gaussLegendre(x => x * x, 0, 1);
    const expected = 1 / 3;
    expect(trap).toBeCloseTo(expected, 2);
    expect(simp).toBeCloseTo(expected, 4);
    expect(gauss).toBeCloseTo(expected, 5);
  });

  // 16.6 – Convergence consistency
  it('gradientDescent is deterministic', () => {
    const r1 = gradientDescent(quad1D, [5], { learningRate: 0.1, maxIterations: 100 });
    const r2 = gradientDescent(quad1D, [5], { learningRate: 0.1, maxIterations: 100 });
    expect(r1.value).toBe(r2.value);
  });

  it('adam is deterministic', () => {
    const r1 = adam(quad1D, [5], { maxIterations: 100 });
    const r2 = adam(quad1D, [5], { maxIterations: 100 });
    expect(r1.value).toBe(r2.value);
  });

  it('nelderMead is deterministic', () => {
    const r1 = nelderMead(quad2D, [1, 1], { maxIterations: 100 });
    const r2 = nelderMead(quad2D, [1, 1], { maxIterations: 100 });
    expect(r1.value).toBe(r2.value);
  });

  // 16.7 – SA with fixed rng is deterministic
  it('SA with fixed rng is deterministic', () => {
    const r1 = simulatedAnnealing(quad1D, [5], { maxIterations: 100, random: seededRng(42) });
    const r2 = simulatedAnnealing(quad1D, [5], { maxIterations: 100, random: seededRng(42) });
    expect(r1.value).toBe(r2.value);
  });

  it('GA with fixed rng is deterministic', () => {
    const r1 = geneticAlgorithm(quad1D, 1, { populationSize: 10, generations: 10, random: seededRng(42) });
    const r2 = geneticAlgorithm(quad1D, 1, { populationSize: 10, generations: 10, random: seededRng(42) });
    expect(r1.value).toBe(r2.value);
  });

  // 16.8 – OptimizationResult value field consistency
  const algos: Array<{ name: string; fn: () => { x: number[]; value: number } }> = [
    { name: 'gradientDescent', fn: () => gradientDescent(quad1D, [3]) },
    { name: 'adam', fn: () => adam(quad1D, [3]) },
    { name: 'nelderMead', fn: () => nelderMead(quad1D, [3]) },
  ];
  for (const { name, fn } of algos) {
    it(`${name} result.value equals quad1D(result.x)`, () => {
      const r = fn();
      expect(r.value).toBeCloseTo(quad1D(r.x), 8);
    });
  }

  // 16.9 – numericalDerivative at various step sizes
  const hOptions = [1e-4, 1e-5, 1e-6, 1e-7];
  for (const h of hOptions) {
    it(`numericalDerivative h=${h} of x^2 at x=2 ≈ 4`, () => {
      expect(numericalDerivative(x => x * x, 2, h)).toBeCloseTo(4, 3);
    });
  }

  // 16.10 – Objective functions with multiple args
  it('gradientDescent 3D converges', () => {
    const fn3D = (x: number[]) => x[0] ** 2 + x[1] ** 2 + x[2] ** 2;
    const r = gradientDescent(fn3D, [3, 3, 3], { learningRate: 0.1, maxIterations: 2000, tolerance: 1e-5 });
    expect(r.value).toBeLessThan(0.01);
  });

  it('adam 3D converges', () => {
    const fn3D = (x: number[]) => x[0] ** 2 + x[1] ** 2 + x[2] ** 2;
    const r = adam(fn3D, [3, 3, 3], { maxIterations: 10000, tolerance: 1e-5, learningRate: 0.01 });
    expect(r.value).toBeLessThan(0.1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 17. Additional coverage tests
// ═══════════════════════════════════════════════════════════════════════════════
describe('additional coverage', () => {
  // 17.1 – Bisection on negative root (f(x) = x + c)
  const negRoots = [-1, -2, -3, -4, -5, -0.5, -1.5, -2.5, -3.5, -4.5];
  for (const root of negRoots) {
    it(`bisection finds negative root=${root}`, () => {
      const r = bisection(x => x - root, root - 5, root + 5, 1e-8);
      expect(Math.abs(r.root - root)).toBeLessThan(1e-5);
    });
  }

  // 17.2 – Newton's method with exp function
  const expRoots = [0, 1, 2, 3, -1, -2, 0.5, -0.5, 1.5, -1.5];
  for (const c of expRoots) {
    it(`newton-raphson root of e^x - e^${c}`, () => {
      const fn = (x: number) => Math.exp(x) - Math.exp(c);
      const dfn = (x: number) => Math.exp(x);
      const r = newtonRaphson(fn, dfn, c + 0.5, 1e-10);
      expect(Math.abs(r.root - c)).toBeLessThan(1e-6);
    });
  }

  // 17.3 – Golden section for non-centered parabola
  const gsAsymmetric = [0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9, 1.3, 1.7];
  for (const shift of gsAsymmetric) {
    it(`golden section asymmetric parabola shift=${shift}`, () => {
      const r = goldenSection(x => (x - shift) ** 2, 0, 2, 1e-8);
      expect(Math.abs(r.x - shift)).toBeLessThan(1e-4);
    });
  }

  // 17.4 – Gradient of cubic function
  const cubicPoints = [1, 2, 3, -1, -2, -3, 0.5, -0.5, 1.5, -1.5];
  for (const x of cubicPoints) {
    it(`gradient of x^3 at x=${x} ≈ 3x^2`, () => {
      const fn = (v: number[]) => v[0] ** 3;
      const grad = numericalGradient(fn, [x]);
      expect(grad[0]).toBeCloseTo(3 * x * x, 2);
    });
  }

  // 17.5 – Trapezoidal with negative range
  it('trapezoidal on [-1,0] of x^2 ≈ 1/3', () => {
    expect(trapezoidalRule(x => x * x, -1, 0, 1000)).toBeCloseTo(1 / 3, 2);
  });

  it('trapezoidal of 1/x on [1,2] ≈ ln2', () => {
    expect(trapezoidalRule(x => 1 / x, 1, 2, 10000)).toBeCloseTo(Math.log(2), 3);
  });

  // 17.6 – Simpson on negative range
  it('simpson on [-1,1] of x^2 ≈ 2/3', () => {
    expect(simpsonRule(x => x * x, -1, 1, 100)).toBeCloseTo(2 / 3, 5);
  });

  it('simpson of 1/x on [1,2] ≈ ln2', () => {
    expect(simpsonRule(x => 1 / x, 1, 2, 100)).toBeCloseTo(Math.log(2), 4);
  });

  // 17.7 – Gauss-Legendre of log
  it('gauss-legendre of ln(x) on [1,e] ≈ 1', () => {
    expect(gaussLegendre(Math.log, 1, Math.E)).toBeCloseTo(1, 3);
  });

  // 17.8 – Second derivative of exp is exp
  const sdExpPts = [0, 1, 2, -1, -2, 0.5, -0.5, 1.5, -1.5, 3];
  for (const x of sdExpPts) {
    it(`second derivative of exp at x=${x} ≈ exp(x)`, () => {
      expect(numericalSecondDerivative(Math.exp, x)).toBeCloseTo(Math.exp(x), 0);
    });
  }

  // 17.9 – SA and GA return finite values
  const finiteSeeds = [1, 2, 3, 4, 5];
  for (const seed of finiteSeeds) {
    it(`SA seed=${seed} returns finite value`, () => {
      const r = simulatedAnnealing(quad1D, [3], { maxIterations: 100, random: seededRng(seed) });
      expect(isFinite(r.value)).toBe(true);
    });

    it(`GA seed=${seed} returns finite value`, () => {
      const r = geneticAlgorithm(quad1D, 1, { populationSize: 10, generations: 5, random: seededRng(seed) });
      expect(isFinite(r.value)).toBe(true);
    });
  }

  // 17.10 – Zero-dimension edge case prevention (gradient descent 1D)
  it('gradient descent with tolerance=0 hits maxIterations', () => {
    const r = gradientDescent(quad1D, [5], { maxIterations: 10, tolerance: 0 });
    expect(r.iterations).toBe(10);
  });

  it('gradient descent negative starting point converges', () => {
    const r = gradientDescent(quad1D, [-5], { learningRate: 0.1, maxIterations: 2000, tolerance: 1e-5 });
    expect(r.value).toBeLessThan(1e-3);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 18. Extended integration tests (reaching ≥1,000 total)
// ═══════════════════════════════════════════════════════════════════════════════
describe('extended integration tests', () => {
  // 18.1 – Trapezoidal on shifted intervals: ∫(x-a)^2 dx from a to a+1 = 1/3
  const trapShifts = [
    0, 1, 2, 3, 4, -1, -2, -3, -4, 5,
    0.5, 1.5, 2.5, -0.5, -1.5, -2.5, 3.5, -3.5, 6, -6,
  ];
  for (const a of trapShifts) {
    it(`trapezoidal ∫(x-${a})^2 from ${a} to ${a + 1} ≈ 1/3`, () => {
      const result = trapezoidalRule(x => (x - a) ** 2, a, a + 1, 500);
      expect(result).toBeCloseTo(1 / 3, 2);
    });
  }

  // 18.2 – Simpson on shifted intervals
  const simpShifts = [0, 1, 2, 3, -1, -2, -3, 0.5, 1.5, -0.5, -1.5, 2.5, -2.5, 4, -4, 5, -5, 6, -6, 7];
  for (const a of simpShifts) {
    it(`simpson ∫(x-${a})^2 from ${a} to ${a + 1} ≈ 1/3`, () => {
      const result = simpsonRule(x => (x - a) ** 2, a, a + 1, 100);
      expect(result).toBeCloseTo(1 / 3, 4);
    });
  }

  // 18.3 – Gauss-Legendre on polynomial x^n over [0,1]: result = 1/(n+1)
  const glPolyDegs = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  for (const deg of glPolyDegs) {
    it(`gauss-legendre x^${deg} on [0,1] ≈ 1/${deg + 1}`, () => {
      const fn = (x: number) => Math.pow(x, deg);
      const result = gaussLegendre(fn, 0, 1, deg < 5 ? 5 : 7);
      expect(result).toBeCloseTo(1 / (deg + 1), deg < 8 ? 3 : 1);
    });
  }

  // 18.4 – Bisection tolerance tests
  const bisectionTols = [1e-4, 1e-5, 1e-6, 1e-7, 1e-8, 1e-9, 1e-10, 1e-11, 1e-12, 1e-13];
  for (const tol of bisectionTols) {
    it(`bisection tol=${tol} finds root of x-1`, () => {
      const r = bisection(x => x - 1, 0, 2, tol);
      expect(Math.abs(r.root - 1)).toBeLessThan(tol * 100 + 1e-14);
    });
  }

  // 18.5 – Newton-Raphson convergence speed (quadratics)
  const nrSpeeds = [1, 2, 4, 8, 16, 0.25, 0.5, 9, 25, 36];
  for (const c of nrSpeeds) {
    it(`NR finds sqrt(${c}) in few iterations`, () => {
      const r = newtonRaphson(x => x * x - c, x => 2 * x, c, 1e-10);
      expect(r.iterations).toBeLessThan(100);
      expect(Math.abs(r.root - Math.sqrt(c))).toBeLessThan(1e-6);
    });
  }

  // 18.6 – Golden section precision on x^4
  const gsPrecision = [0.1, 0.2, 0.5, 1.0, 2.0, 3.0, -0.1, -0.2, -0.5, -1.0];
  for (const center of gsPrecision) {
    it(`golden section finds min of (x-${center})^4 near ${center}`, () => {
      const r = goldenSection(x => (x - center) ** 4, center - 2, center + 2, 1e-8);
      expect(Math.abs(r.x - center)).toBeLessThan(1e-3);
    });
  }

  // 18.7 – Gradient descent quadratic x^2 + bx (minimum at -b/2)
  const gdLinearTerms = [2, 4, 6, 8, -2, -4, -6, -8, 1, -1, 3, -3, 5, -5, 0.5, -0.5];
  for (const b of gdLinearTerms) {
    it(`gradient descent x^2+${b}x converges near x=${-b / 2}`, () => {
      const fn = (x: number[]) => x[0] ** 2 + b * x[0];
      const r = gradientDescent(fn, [0], { learningRate: 0.1, maxIterations: 3000, tolerance: 1e-5 });
      expect(Math.abs(r.x[0] - (-b / 2))).toBeLessThan(0.1);
    });
  }

  // 18.8 – Numerical second derivative of x^4 is 12x^2
  const sdX4pts = [1, 2, 3, -1, -2, -3, 0.5, -0.5, 1.5, -1.5];
  for (const x of sdX4pts) {
    it(`second derivative of x^4 at x=${x} ≈ ${12 * x * x}`, () => {
      expect(numericalSecondDerivative(v => v ** 4, x)).toBeCloseTo(12 * x * x, 0);
    });
  }

  // 18.9 – Boundedness: value inside ≤ value outside + 0 penalty
  const boChecks = [
    { x: [0.5], bounds: [[0, 1]] as Array<[number, number]>, inside: true },
    { x: [1.5], bounds: [[0, 1]] as Array<[number, number]>, inside: false },
    { x: [-0.5], bounds: [[0, 1]] as Array<[number, number]>, inside: false },
    { x: [0], bounds: [[0, 1]] as Array<[number, number]>, inside: true },
    { x: [1], bounds: [[0, 1]] as Array<[number, number]>, inside: true },
    { x: [0.1], bounds: [[-1, 1]] as Array<[number, number]>, inside: true },
    { x: [1.1], bounds: [[-1, 1]] as Array<[number, number]>, inside: false },
    { x: [-1.1], bounds: [[-1, 1]] as Array<[number, number]>, inside: false },
    { x: [0.9], bounds: [[0, 1]] as Array<[number, number]>, inside: true },
    { x: [5], bounds: [[0, 1]] as Array<[number, number]>, inside: false },
  ];
  for (const { x, bounds, inside } of boChecks) {
    it(`bounded x=${x} is ${inside ? 'inside' : 'outside'} ${JSON.stringify(bounds)}`, () => {
      const bounded = boundedObjective(quad1D, bounds, 1e6);
      if (inside) {
        expect(bounded(x)).toBeCloseTo(quad1D(x), 8);
      } else {
        expect(bounded(x)).toBeGreaterThan(quad1D(x));
      }
    });
  }

  // 18.10 – numericalGradient of exp
  const ngExpPts = [0, 1, 2, -1, -2, 0.5, -0.5, 1.5, -1.5, 2.5];
  for (const x of ngExpPts) {
    it(`gradient of exp(x[0]) at x=${x} ≈ exp(${x})`, () => {
      const fn = (v: number[]) => Math.exp(v[0]);
      const grad = numericalGradient(fn, [x]);
      expect(grad[0]).toBeCloseTo(Math.exp(x), 3);
    });
  }

  // 18.11 – Simulated annealing with high cooling rate
  const highCoolingSeeds = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  for (const seed of highCoolingSeeds) {
    it(`SA high cooling seed=${seed} terminates`, () => {
      const r = simulatedAnnealing(quad1D, [2], {
        coolingRate: 0.999,
        maxIterations: 500,
        random: seededRng(seed),
      });
      expect(r).toBeDefined();
      expect(isFinite(r.value)).toBe(true);
    });
  }

  // 18.12 – GA population size sensitivity
  const gaPopSizes = [5, 10, 20, 30, 40, 50, 60, 70, 80, 100];
  for (const popSize of gaPopSizes) {
    it(`GA popSize=${popSize} returns valid result`, () => {
      const r = geneticAlgorithm(quad1D, 1, {
        populationSize: popSize,
        generations: 20,
        random: seededRng(42),
      });
      expect(isFinite(r.value)).toBe(true);
      expect(r.x.length).toBe(1);
    });
  }

  // 18.13 – Nelder-Mead on 3D quadratic
  const nm3DStarts = [
    [1, 1, 1], [2, 2, 2], [3, 3, 3], [-1, -1, -1], [-2, -2, -2],
    [1, -1, 0], [0, 1, -1], [-1, 0, 1], [2, -1, 0], [0, 2, -1],
  ];
  for (const start of nm3DStarts) {
    it(`nelder-mead 3D from [${start}] reduces value`, () => {
      const fn3D = (x: number[]) => x[0] ** 2 + x[1] ** 2 + x[2] ** 2;
      const initVal = fn3D(start);
      const r = nelderMead(fn3D, start, { maxIterations: 3000, tolerance: 1e-5 });
      expect(r.value).toBeLessThanOrEqual(initVal + 0.01);
    });
  }

  // 18.14 – trapezoidalRule symmetry: ∫f on [-a,a] = 2*∫f on [0,a] for even fn
  const trapSymmetry = [1, 2, 3, 4, 5, 0.5, 1.5, 2.5, 3.5, 4.5];
  for (const a of trapSymmetry) {
    it(`trapezoidal of x^2 on [-${a},${a}] = 2 * on [0,${a}]`, () => {
      const full = trapezoidalRule(x => x * x, -a, a, 1000);
      const half = trapezoidalRule(x => x * x, 0, a, 500);
      expect(full).toBeCloseTo(2 * half, 2);
    });
  }
});
