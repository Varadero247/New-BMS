// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  Polynomial,
  poly,
  monomial,
  constant,
  linear,
  quadratic,
  quadraticRoots,
  lagrangeInterpolation,
  lagrangeInterpolationTuples,
  chebyshev,
  legendre,
  newtonInterpolation,
  newtonInterpolationCoeffs,
  polyAdd,
  polySub,
  polyMul,
  polyEval,
  polyDerivative,
  polyIntegral,
  gcd,
} from '../polynomial';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

const EPS = 1e-9;
function near(a: number, b: number, eps = EPS): boolean {
  return Math.abs(a - b) <= eps;
}

// ---------------------------------------------------------------------------
// 1. Constructor / degree / coeff / coefficients
// ---------------------------------------------------------------------------

describe('Polynomial constructor and basic properties', () => {
  it('zero polynomial from empty array has degree -Infinity', () => {
    expect(new Polynomial([]).degree).toBe(-Infinity);
  });
  it('zero polynomial isZero()', () => {
    expect(new Polynomial([]).isZero()).toBe(true);
  });
  it('zero polynomial coefficients is []', () => {
    expect(new Polynomial([]).coefficients).toEqual([]);
  });
  it('zero polynomial coeff(0) is 0', () => {
    expect(new Polynomial([]).coeff(0)).toBe(0);
  });
  it('trailing zeros are trimmed — [1,0] has degree 0', () => {
    expect(new Polynomial([1, 0]).degree).toBe(0);
  });
  it('[0] is zero polynomial', () => {
    expect(new Polynomial([0]).isZero()).toBe(true);
  });
  it('[0,0,0] is zero polynomial', () => {
    expect(new Polynomial([0, 0, 0]).isZero()).toBe(true);
  });
  it('constant polynomial degree 0', () => {
    expect(new Polynomial([5]).degree).toBe(0);
  });
  it('linear polynomial degree 1', () => {
    expect(new Polynomial([0, 3]).degree).toBe(1);
  });
  it('quadratic polynomial degree 2', () => {
    expect(new Polynomial([1, 2, 3]).degree).toBe(2);
  });
  it('coeff of out-of-range index returns 0', () => {
    expect(new Polynomial([1, 2]).coeff(5)).toBe(0);
  });
  it('coeff of negative index returns 0', () => {
    expect(new Polynomial([1, 2]).coeff(-1)).toBe(0);
  });
  it('coefficients array is a clone (mutation proof)', () => {
    const p = new Polynomial([1, 2, 3]);
    const c = p.coefficients;
    c[0] = 99;
    expect(p.coeff(0)).toBe(1);
  });
  it('non-zero polynomial isZero() is false', () => {
    expect(new Polynomial([1]).isZero()).toBe(false);
  });

  // Loop: degree tests for degrees 0..29
  for (let d = 0; d <= 29; d++) {
    const coeffs = new Array<number>(d + 1).fill(0).map((_, i) => (i === d ? 1 : 0));
    it(`monomial x^${d} has degree ${d}`, () => {
      expect(new Polynomial(coeffs).degree).toBe(d);
    });
  }

  // Loop: coeff retrieval
  const pCoeff = new Polynomial([10, 20, 30, 40]);
  for (let i = 0; i < 4; i++) {
    it(`coeff(${i}) of [10,20,30,40] is ${(i + 1) * 10}`, () => {
      expect(pCoeff.coeff(i)).toBe((i + 1) * 10);
    });
  }

  // Loop: coefficients array contents
  for (let d = 1; d <= 5; d++) {
    const arr = Array.from({ length: d + 1 }, (_, i) => i + 1);
    it(`coefficients for degree-${d} polynomial returns correct array`, () => {
      expect(new Polynomial(arr).coefficients).toEqual(arr);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. evaluate
// ---------------------------------------------------------------------------

describe('Polynomial evaluate', () => {
  it('zero polynomial evaluates to 0 at x=0', () => {
    expect(new Polynomial([]).evaluate(0)).toBe(0);
  });
  it('zero polynomial evaluates to 0 at x=100', () => {
    expect(new Polynomial([]).evaluate(100)).toBe(0);
  });
  it('constant 5 evaluates to 5 at any x', () => {
    const p = new Polynomial([5]);
    expect(p.evaluate(0)).toBe(5);
    expect(p.evaluate(7)).toBe(5);
  });
  it('x evaluates to x', () => {
    const p = new Polynomial([0, 1]);
    expect(p.evaluate(3)).toBe(3);
    expect(p.evaluate(-2)).toBe(-2);
  });
  it('1 + x evaluates correctly', () => {
    const p = new Polynomial([1, 1]);
    expect(p.evaluate(2)).toBe(3);
    expect(p.evaluate(0)).toBe(1);
  });
  it('x^2 evaluates to 4 at x=2', () => {
    expect(new Polynomial([0, 0, 1]).evaluate(2)).toBe(4);
  });
  it('x^2 - 1 has roots at ±1', () => {
    const p = new Polynomial([-1, 0, 1]);
    expect(p.evaluate(1)).toBe(0);
    expect(p.evaluate(-1)).toBe(0);
  });
  it('Horner evaluation at x=0 returns constant term', () => {
    const p = new Polynomial([7, 3, 2]);
    expect(p.evaluate(0)).toBe(7);
  });

  // Loop: p(x) = x for x in -10..10
  for (let x = -10; x <= 10; x++) {
    it(`poly(0,1).evaluate(${x}) === ${x}`, () => {
      expect(new Polynomial([0, 1]).evaluate(x)).toBe(x);
    });
  }

  // Loop: p(x) = x^2 for x in 0..9
  for (let x = 0; x <= 9; x++) {
    it(`poly(0,0,1).evaluate(${x}) === ${x * x}`, () => {
      expect(new Polynomial([0, 0, 1]).evaluate(x)).toBeCloseTo(x * x, 8);
    });
  }

  // Loop: p(x) = 2x + 3 for x in -5..5
  for (let x = -5; x <= 5; x++) {
    it(`(2x+3).evaluate(${x}) === ${2 * x + 3}`, () => {
      expect(new Polynomial([3, 2]).evaluate(x)).toBe(2 * x + 3);
    });
  }

  // Loop: p(x) = x^3 for x in -3..3
  for (let x = -3; x <= 3; x++) {
    it(`x^3 evaluated at ${x} is ${x ** 3}`, () => {
      expect(new Polynomial([0, 0, 0, 1]).evaluate(x)).toBeCloseTo(x ** 3, 8);
    });
  }

  // Loop: general polynomial sum evaluation
  const pSum = new Polynomial([1, 1, 1, 1]); // 1 + x + x^2 + x^3
  for (let x = 0; x <= 4; x++) {
    const expected = 1 + x + x * x + x ** 3;
    it(`(1+x+x^2+x^3) at x=${x} is ${expected}`, () => {
      expect(pSum.evaluate(x)).toBeCloseTo(expected, 8);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. add
// ---------------------------------------------------------------------------

describe('Polynomial add', () => {
  it('zero + zero = zero', () => {
    expect(new Polynomial([]).add(new Polynomial([])).isZero()).toBe(true);
  });
  it('p + zero = p', () => {
    const p = new Polynomial([1, 2, 3]);
    expect(p.add(new Polynomial([])).equals(p)).toBe(true);
  });
  it('zero + p = p', () => {
    const p = new Polynomial([1, 2, 3]);
    expect(new Polynomial([]).add(p).equals(p)).toBe(true);
  });
  it('p + (-p) = zero', () => {
    const p = new Polynomial([1, 2, 3]);
    expect(p.add(p.negate()).isZero()).toBe(true);
  });
  it('degree of sum is max of degrees (general case)', () => {
    const p = new Polynomial([1, 2]);
    const q = new Polynomial([3, 4, 5]);
    expect(p.add(q).degree).toBe(2);
  });
  it('add constant to linear', () => {
    const p = new Polynomial([2, 3]); // 2 + 3x
    const q = new Polynomial([1]);    // 1
    expect(p.add(q).coefficients).toEqual([3, 3]);
  });
  it('add polynomials with cancellation reduces degree', () => {
    const p = new Polynomial([1, 2, 3]);
    const q = new Polynomial([0, 0, -3]);
    expect(p.add(q).degree).toBe(1);
  });
  it('add is commutative', () => {
    const p = new Polynomial([1, 2, 3]);
    const q = new Polynomial([4, 5]);
    expect(p.add(q).equals(q.add(p))).toBe(true);
  });
  it('add is associative', () => {
    const a = new Polynomial([1, 0, 1]);
    const b = new Polynomial([0, 2]);
    const c = new Polynomial([3]);
    expect(a.add(b).add(c).equals(a.add(b.add(c)))).toBe(true);
  });

  // Loop: add n*p and m*p should equal (n+m)*p
  for (let n = 0; n <= 5; n++) {
    for (let m = 0; m <= 5; m++) {
      it(`${n}*x + ${m}*x = ${n + m}*x`, () => {
        const xPoly = new Polynomial([0, 1]);
        const np = xPoly.scale(n);
        const mp = xPoly.scale(m);
        const sum = np.add(mp);
        const expected = xPoly.scale(n + m);
        expect(sum.equals(expected)).toBe(true);
      });
    }
  }

  // Loop: constant addition
  for (let c = -5; c <= 5; c++) {
    it(`constant(1) + constant(${c}) = constant(${1 + c})`, () => {
      const p = new Polynomial([1]);
      const q = new Polynomial([c]);
      const result = p.add(q);
      if (1 + c === 0) {
        expect(result.isZero()).toBe(true);
      } else {
        expect(result.coeff(0)).toBe(1 + c);
      }
    });
  }

  // Loop: verify add evaluates correctly at several x
  const p1 = new Polynomial([1, 2, 3]);
  const p2 = new Polynomial([4, 5]);
  const pAdd = p1.add(p2);
  for (let x = -3; x <= 3; x++) {
    it(`add: (p1+p2)(${x}) === p1(${x})+p2(${x})`, () => {
      expect(pAdd.evaluate(x)).toBeCloseTo(p1.evaluate(x) + p2.evaluate(x), 8);
    });
  }
});

// ---------------------------------------------------------------------------
// 4. subtract
// ---------------------------------------------------------------------------

describe('Polynomial subtract', () => {
  it('p - p = zero', () => {
    const p = new Polynomial([1, 2, 3]);
    expect(p.subtract(p).isZero()).toBe(true);
  });
  it('p - zero = p', () => {
    const p = new Polynomial([1, 2, 3]);
    expect(p.subtract(new Polynomial([])).equals(p)).toBe(true);
  });
  it('zero - p = -p', () => {
    const p = new Polynomial([1, 2, 3]);
    const neg = new Polynomial([]).subtract(p);
    expect(neg.equals(p.negate())).toBe(true);
  });
  it('subtract reduces degree on cancellation', () => {
    const p = new Polynomial([1, 2, 3]);
    const q = new Polynomial([0, 0, 3]);
    expect(p.subtract(q).degree).toBe(1);
  });
  it('subtract is anti-commutative: p-q = -(q-p)', () => {
    const p = new Polynomial([3, 1]);
    const q = new Polynomial([1, 2]);
    expect(p.subtract(q).equals(q.subtract(p).negate())).toBe(true);
  });
  it('(a - b) + b = a', () => {
    const a = new Polynomial([5, 3, 1]);
    const b = new Polynomial([2, 1]);
    expect(a.subtract(b).add(b).equals(a)).toBe(true);
  });

  // Loop: subtract same scalar from constant
  for (let c = -4; c <= 4; c++) {
    it(`constant(5) - constant(${c}) evaluates to ${5 - c}`, () => {
      const p = new Polynomial([5]);
      const q = new Polynomial([c]);
      expect(p.subtract(q).evaluate(0)).toBe(5 - c);
    });
  }

  // Loop: verify subtract evaluates correctly
  const pA = new Polynomial([1, 2, 3]);
  const pB = new Polynomial([4, 5]);
  const pSub = pA.subtract(pB);
  for (let x = -4; x <= 4; x++) {
    it(`subtract: (pA-pB)(${x}) === pA(${x})-pB(${x})`, () => {
      expect(pSub.evaluate(x)).toBeCloseTo(pA.evaluate(x) - pB.evaluate(x), 8);
    });
  }

  // Loop: x^n - x^n = zero
  for (let d = 1; d <= 6; d++) {
    it(`x^${d} - x^${d} is zero`, () => {
      const c = new Array<number>(d + 1).fill(0);
      c[d] = 1;
      const p = new Polynomial(c);
      expect(p.subtract(p).isZero()).toBe(true);
    });
  }

  // Loop: (a-b)(x) = a(x) - b(x) for several pairs
  const pairs = [[1, 2], [3, 5], [7, 2], [0, 4], [4, 0]];
  for (const [a, b] of pairs) {
    it(`(${a}x+1) - (${b}x+1) has correct linear term`, () => {
      const p = new Polynomial([1, a]);
      const q = new Polynomial([1, b]);
      expect(p.subtract(q).coeff(1)).toBeCloseTo(a - b, 8);
    });
  }
});

// ---------------------------------------------------------------------------
// 5. multiply
// ---------------------------------------------------------------------------

describe('Polynomial multiply', () => {
  it('zero * p = zero', () => {
    const p = new Polynomial([1, 2, 3]);
    expect(new Polynomial([]).multiply(p).isZero()).toBe(true);
  });
  it('p * zero = zero', () => {
    const p = new Polynomial([1, 2, 3]);
    expect(p.multiply(new Polynomial([])).isZero()).toBe(true);
  });
  it('p * 1 = p', () => {
    const p = new Polynomial([1, 2, 3]);
    const one = new Polynomial([1]);
    expect(p.multiply(one).equals(p)).toBe(true);
  });
  it('degree of product = sum of degrees', () => {
    const p = new Polynomial([1, 1]); // 1+x degree 1
    const q = new Polynomial([1, 0, 1]); // 1+x^2 degree 2
    expect(p.multiply(q).degree).toBe(3);
  });
  it('(1+x)^2 = 1 + 2x + x^2', () => {
    const p = new Polynomial([1, 1]);
    const r = p.multiply(p);
    expect(r.equals(new Polynomial([1, 2, 1]))).toBe(true);
  });
  it('(x-1)(x+1) = x^2 - 1', () => {
    const a = new Polynomial([-1, 1]);
    const b = new Polynomial([1, 1]);
    expect(a.multiply(b).equals(new Polynomial([-1, 0, 1]))).toBe(true);
  });
  it('multiply is commutative', () => {
    const p = new Polynomial([1, 2, 3]);
    const q = new Polynomial([4, 5]);
    expect(p.multiply(q).equals(q.multiply(p))).toBe(true);
  });
  it('multiply is associative', () => {
    const a = new Polynomial([1, 1]);
    const b = new Polynomial([1, 2]);
    const c = new Polynomial([1, 3]);
    expect(a.multiply(b).multiply(c).equals(a.multiply(b.multiply(c)))).toBe(true);
  });
  it('distributive: a*(b+c) = a*b + a*c', () => {
    const a = new Polynomial([1, 2]);
    const b = new Polynomial([3, 0, 1]);
    const c = new Polynomial([2, 1]);
    expect(a.multiply(b.add(c)).equals(a.multiply(b).add(a.multiply(c)))).toBe(true);
  });

  // Loop: x^m * x^n = x^(m+n)
  for (let m = 0; m <= 4; m++) {
    for (let n = 0; n <= 4; n++) {
      it(`x^${m} * x^${n} = x^${m + n}`, () => {
        const pm = monomial(1, m);
        const pn = monomial(1, n);
        const expected = monomial(1, m + n);
        expect(pm.multiply(pn).equals(expected)).toBe(true);
      });
    }
  }

  // Loop: evaluate (p*q)(x) = p(x)*q(x)
  const pM = new Polynomial([1, 2]);
  const qM = new Polynomial([3, 4, 5]);
  const pqM = pM.multiply(qM);
  for (let x = -3; x <= 3; x++) {
    it(`multiply: (pM*qM)(${x}) = pM(${x})*qM(${x})`, () => {
      expect(pqM.evaluate(x)).toBeCloseTo(pM.evaluate(x) * qM.evaluate(x), 8);
    });
  }
});

// ---------------------------------------------------------------------------
// 6. scale
// ---------------------------------------------------------------------------

describe('Polynomial scale', () => {
  it('scale by 0 gives zero polynomial', () => {
    expect(new Polynomial([1, 2, 3]).scale(0).isZero()).toBe(true);
  });
  it('scale by 1 returns same polynomial', () => {
    const p = new Polynomial([1, 2, 3]);
    expect(p.scale(1).equals(p)).toBe(true);
  });
  it('scale by -1 negates', () => {
    const p = new Polynomial([1, -2, 3]);
    expect(p.scale(-1).equals(new Polynomial([-1, 2, -3]))).toBe(true);
  });
  it('scale zero polynomial by any scalar is still zero', () => {
    expect(new Polynomial([]).scale(7).isZero()).toBe(true);
  });
  it('scale(2) doubles all coefficients', () => {
    const p = new Polynomial([1, 2, 3]);
    const r = p.scale(2);
    expect(r.coeff(0)).toBe(2);
    expect(r.coeff(1)).toBe(4);
    expect(r.coeff(2)).toBe(6);
  });

  // Loop: scale constant polynomial
  for (let s = -5; s <= 5; s++) {
    it(`constant(3).scale(${s}) evaluates to ${3 * s} at x=0`, () => {
      expect(new Polynomial([3]).scale(s).evaluate(0)).toBe(3 * s);
    });
  }

  // Loop: scale(n).evaluate(x) = n * evaluate(x)
  const pScl = new Polynomial([1, 2, 3]);
  for (let s = -3; s <= 3; s++) {
    for (let x = -2; x <= 2; x++) {
      it(`(p.scale(${s}))(${x}) = ${s}*p(${x})`, () => {
        expect(pScl.scale(s).evaluate(x)).toBeCloseTo(s * pScl.evaluate(x), 8);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 7. derivative
// ---------------------------------------------------------------------------

describe('Polynomial derivative', () => {
  it('derivative of zero is zero', () => {
    expect(new Polynomial([]).derivative().isZero()).toBe(true);
  });
  it('derivative of constant is zero', () => {
    expect(new Polynomial([5]).derivative().isZero()).toBe(true);
  });
  it('derivative of x is 1', () => {
    expect(new Polynomial([0, 1]).derivative().equals(new Polynomial([1]))).toBe(true);
  });
  it('derivative of x^2 is 2x', () => {
    expect(new Polynomial([0, 0, 1]).derivative().equals(new Polynomial([0, 2]))).toBe(true);
  });
  it('derivative of x^3 is 3x^2', () => {
    const p = new Polynomial([0, 0, 0, 1]);
    expect(p.derivative().equals(new Polynomial([0, 0, 3]))).toBe(true);
  });
  it('derivative of 3x^2 + 2x + 1 is 6x + 2', () => {
    const p = new Polynomial([1, 2, 3]);
    expect(p.derivative().equals(new Polynomial([2, 6]))).toBe(true);
  });
  it('derivative reduces degree by 1', () => {
    const p = new Polynomial([1, 2, 3, 4]); // degree 3
    expect(p.derivative().degree).toBe(2);
  });
  it('linearity of derivative: d(a+b)/dx = da/dx + db/dx', () => {
    const a = new Polynomial([1, 2, 3]);
    const b = new Polynomial([4, 5]);
    expect(a.add(b).derivative().equals(a.derivative().add(b.derivative()))).toBe(true);
  });
  it('product rule: d(p*q)/dx = dp/dx * q + p * dq/dx', () => {
    const p = new Polynomial([1, 1]); // 1+x
    const q = new Polynomial([2, 3]); // 2+3x
    const lhs = p.multiply(q).derivative();
    const rhs = p.derivative().multiply(q).add(p.multiply(q.derivative()));
    expect(lhs.equals(rhs)).toBe(true);
  });

  // Loop: derivative of x^n is n*x^(n-1)
  for (let n = 1; n <= 10; n++) {
    it(`derivative of x^${n} is ${n}*x^${n - 1}`, () => {
      const p = monomial(1, n);
      const d = p.derivative();
      const expected = monomial(n, n - 1);
      expect(d.equals(expected)).toBe(true);
    });
  }

  // Loop: derivative evaluation matches numerical derivative
  const pDeriv = new Polynomial([1, 3, 3, 1]); // (1+x)^3
  for (let x = -3; x <= 3; x++) {
    it(`derivative of (1+x)^3 at x=${x} matches numerical`, () => {
      const h = 1e-7;
      const numerical = (pDeriv.evaluate(x + h) - pDeriv.evaluate(x - h)) / (2 * h);
      expect(pDeriv.derivative().evaluate(x)).toBeCloseTo(numerical, 4);
    });
  }

  // Loop: derivative of scaled polynomial
  for (let s = 1; s <= 5; s++) {
    it(`derivative of ${s}*x^2 is ${2 * s}*x`, () => {
      const p = monomial(s, 2);
      expect(p.derivative().equals(monomial(2 * s, 1))).toBe(true);
    });
  }

  // Loop: second derivative of x^n is n*(n-1)*x^(n-2)
  for (let n = 2; n <= 8; n++) {
    it(`second derivative of x^${n} is ${n * (n - 1)}*x^${n - 2}`, () => {
      const p = monomial(1, n);
      const d2 = p.derivative().derivative();
      const expected = monomial(n * (n - 1), n - 2);
      expect(d2.equals(expected)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 8. integral
// ---------------------------------------------------------------------------

describe('Polynomial integral', () => {
  it('integral of zero is constant', () => {
    expect(new Polynomial([]).integral().equals(new Polynomial([0]))).toBe(true);
  });
  it('integral of zero with constant 5 is constant 5', () => {
    expect(new Polynomial([]).integral(5).equals(new Polynomial([5]))).toBe(true);
  });
  it('integral of 1 is x (constant=0)', () => {
    expect(new Polynomial([1]).integral().equals(new Polynomial([0, 1]))).toBe(true);
  });
  it('integral of x is x^2/2', () => {
    const p = new Polynomial([0, 1]).integral();
    expect(p.coeff(0)).toBe(0);
    expect(p.coeff(2)).toBeCloseTo(0.5, 8);
  });
  it('integral of 2x is x^2', () => {
    const p = new Polynomial([0, 2]).integral();
    expect(p.equals(new Polynomial([0, 0, 1]))).toBe(true);
  });
  it('derivative of integral = original', () => {
    const p = new Polynomial([3, 1, 4, 1, 5]);
    expect(p.integral().derivative().equals(p)).toBe(true);
  });
  it('integral of constant c with constant k = kx + cx^2/2', () => {
    const p = new Polynomial([2]).integral(3); // antideriv of 2 is 2x, plus constant 3
    expect(p.coeff(0)).toBe(3);
    expect(p.coeff(1)).toBe(2);
  });
  it('integral of x^n is x^(n+1)/(n+1)', () => {
    for (let n = 0; n <= 5; n++) {
      const p = monomial(1, n).integral();
      expect(p.coeff(n + 1)).toBeCloseTo(1 / (n + 1), 8);
    }
  });

  // Loop: integral of n is n*x
  for (let n = -5; n <= 5; n++) {
    it(`integral of constant(${n}) has coeff[1]=${n}`, () => {
      const p = new Polynomial([n]).integral();
      expect(p.coeff(1)).toBe(n);
    });
  }

  // Loop: integral with various constants
  for (let k = -3; k <= 3; k++) {
    it(`integral of x with constant ${k} has coeff[0]=${k}`, () => {
      const p = new Polynomial([0, 1]).integral(k);
      expect(p.coeff(0)).toBe(k);
    });
  }

  // Loop: integral degree is degree+1
  for (let d = 0; d <= 8; d++) {
    it(`integral of degree-${d} poly has degree ${d + 1}`, () => {
      const c = new Array<number>(d + 1).fill(1);
      const p = new Polynomial(c);
      expect(p.integral().degree).toBe(d + 1);
    });
  }
});

// ---------------------------------------------------------------------------
// 9. divmod
// ---------------------------------------------------------------------------

describe('Polynomial divmod', () => {
  it('throws on division by zero polynomial', () => {
    const p = new Polynomial([1, 2, 3]);
    expect(() => p.divmod(new Polynomial([]))).toThrow();
  });
  it('p divmod p: quotient=1, remainder=0', () => {
    const p = new Polynomial([1, 2, 3]);
    const { quotient, remainder } = p.divmod(p);
    expect(quotient.equals(new Polynomial([1]))).toBe(true);
    expect(remainder.isZero()).toBe(true);
  });
  it('p divmod 1: quotient=p, remainder=0', () => {
    const p = new Polynomial([1, 2, 3]);
    const one = new Polynomial([1]);
    const { quotient, remainder } = p.divmod(one);
    expect(quotient.equals(p)).toBe(true);
    expect(remainder.isZero()).toBe(true);
  });
  it('x^2 divmod x: quotient=x, remainder=0', () => {
    const p = new Polynomial([0, 0, 1]);
    const q = new Polynomial([0, 1]);
    const { quotient, remainder } = p.divmod(q);
    expect(quotient.equals(new Polynomial([0, 1]))).toBe(true);
    expect(remainder.isZero()).toBe(true);
  });
  it('x^2+1 divmod x+1: remainder check', () => {
    const p = new Polynomial([1, 0, 1]); // x^2 + 1
    const d = new Polynomial([1, 1]);    // x + 1
    const { quotient, remainder } = p.divmod(d);
    // p = d * quotient + remainder
    const reconstructed = d.multiply(quotient).add(remainder);
    expect(reconstructed.equals(p)).toBe(true);
  });
  it('degree of quotient is deg(p)-deg(d)', () => {
    const p = new Polynomial([1, 0, 0, 1]); // degree 3
    const d = new Polynomial([1, 1]);        // degree 1
    const { quotient } = p.divmod(d);
    expect(quotient.degree).toBe(2);
  });
  it('degree of remainder < degree of divisor', () => {
    const p = new Polynomial([2, 3, 1]);
    const d = new Polynomial([1, 2]);
    const { remainder } = p.divmod(d);
    expect((remainder.degree as number) < (d.degree as number) || remainder.isZero()).toBe(true);
  });
  it('when deg(this) < deg(divisor): quotient=0, remainder=this', () => {
    const p = new Polynomial([1, 2]);
    const d = new Polynomial([1, 0, 1]);
    const { quotient, remainder } = p.divmod(d);
    expect(quotient.isZero()).toBe(true);
    expect(remainder.equals(p)).toBe(true);
  });

  // Loop: verify reconstruction p = d*q + r
  const testCases: [number[], number[]][] = [
    [[1, 2, 1], [1, 1]],
    [[6, 11, 6, 1], [1, 1]],
    [[2, 0, 1], [1, 1]],
    [[-3, 0, 0, 1], [3, 1]],
    [[1, 0, 0, 0, 1], [1, 0, 1]],
  ];
  for (let i = 0; i < testCases.length; i++) {
    const [pc, dc] = testCases[i];
    it(`divmod case ${i}: reconstruction holds`, () => {
      const p = new Polynomial(pc);
      const d = new Polynomial(dc);
      const { quotient, remainder } = p.divmod(d);
      const reconstructed = d.multiply(quotient).add(remainder);
      expect(reconstructed.equals(p, 1e-9)).toBe(true);
    });
  }

  // Loop: x^n divmod x has quotient x^(n-1) and remainder 0
  for (let n = 1; n <= 10; n++) {
    it(`x^${n} divmod x: remainder=0`, () => {
      const p = monomial(1, n);
      const d = new Polynomial([0, 1]);
      const { remainder } = p.divmod(d);
      expect(remainder.isZero()).toBe(true);
    });
  }

  // Loop: constant divmod constant
  for (let a = 1; a <= 5; a++) {
    for (let b = 1; b <= 5; b++) {
      it(`constant(${a}) divmod constant(${b}): q=${a / b}, r=0`, () => {
        const p = new Polynomial([a]);
        const d = new Polynomial([b]);
        const { quotient, remainder } = p.divmod(d);
        expect(quotient.evaluate(0)).toBeCloseTo(a / b, 8);
        expect(remainder.isZero()).toBe(true);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 10. compose
// ---------------------------------------------------------------------------

describe('Polynomial compose', () => {
  it('zero.compose(p) = zero', () => {
    const p = new Polynomial([1, 2]);
    expect(new Polynomial([]).compose(p).isZero()).toBe(true);
  });
  it('constant.compose(p) = constant', () => {
    const p = new Polynomial([5]);
    const q = new Polynomial([1, 2, 3]);
    expect(p.compose(q).equals(p)).toBe(true);
  });
  it('x.compose(p) = p', () => {
    const x = new Polynomial([0, 1]);
    const p = new Polynomial([1, 2, 3]);
    expect(x.compose(p).equals(p)).toBe(true);
  });
  it('p.compose(zero) = p(0) constant', () => {
    const p = new Polynomial([3, 2, 1]);
    const pOfZero = p.compose(new Polynomial([]));
    expect(pOfZero.equals(new Polynomial([p.evaluate(0)]))).toBe(true);
  });
  it('(x^2).compose(x+1) = (x+1)^2', () => {
    const x2 = new Polynomial([0, 0, 1]);
    const xp1 = new Polynomial([1, 1]);
    const result = x2.compose(xp1);
    const expected = xp1.pow(2);
    expect(result.equals(expected)).toBe(true);
  });
  it('compose evaluation matches direct evaluation', () => {
    const f = new Polynomial([1, 0, 1]); // 1 + x^2
    const g = new Polynomial([2, 3]);    // 2 + 3x
    const fg = f.compose(g);
    for (let x = -2; x <= 2; x++) {
      expect(fg.evaluate(x)).toBeCloseTo(f.evaluate(g.evaluate(x)), 8);
    }
  });
  it('(a+bx).compose(cx+d) = a + b*(cx+d)', () => {
    const f = new Polynomial([2, 3]); // 2 + 3x
    const g = new Polynomial([4, 5]); // 4 + 5x
    const fg = f.compose(g);
    for (let x = -3; x <= 3; x++) {
      expect(fg.evaluate(x)).toBeCloseTo(2 + 3 * (4 + 5 * x), 8);
    }
  });

  // Loop: evaluate f(g(x)) at x=0..9
  const fComp = new Polynomial([1, 2, 1]); // (1+x)^2
  const gComp = new Polynomial([1, 1]);    // 1+x
  const fgComp = fComp.compose(gComp);
  for (let x = 0; x <= 9; x++) {
    it(`compose: f(g(${x})) = ${fComp.evaluate(gComp.evaluate(x))}`, () => {
      expect(fgComp.evaluate(x)).toBeCloseTo(fComp.evaluate(gComp.evaluate(x)), 8);
    });
  }

  // Loop: p.compose(identity) = p
  const testPolys = [
    new Polynomial([1, 2, 3]),
    new Polynomial([5]),
    new Polynomial([0, 1]),
    new Polynomial([0, 0, 0, 1]),
  ];
  const identity = new Polynomial([0, 1]);
  for (let i = 0; i < testPolys.length; i++) {
    it(`p${i}.compose(identity) = p${i}`, () => {
      expect(testPolys[i].compose(identity).equals(testPolys[i])).toBe(true);
    });
  }

  // Loop: compose with constant
  for (let c = -3; c <= 3; c++) {
    it(`(x^2+1).compose(constant(${c})) = ${c * c + 1}`, () => {
      const f = new Polynomial([1, 0, 1]);
      const g = new Polynomial([c]);
      expect(f.compose(g).evaluate(0)).toBeCloseTo(c * c + 1, 8);
    });
  }
});

// ---------------------------------------------------------------------------
// 11. toString
// ---------------------------------------------------------------------------

describe('Polynomial toString', () => {
  it('zero polynomial toString is "0"', () => {
    expect(new Polynomial([]).toString()).toBe('0');
  });
  it('constant 1 toString is "1"', () => {
    expect(new Polynomial([1]).toString()).toBe('1');
  });
  it('constant -5 toString is "-5"', () => {
    expect(new Polynomial([-5]).toString()).toBe('-5');
  });
  it('x toString is "x"', () => {
    expect(new Polynomial([0, 1]).toString()).toBe('x');
  });
  it('-x toString is "-x"', () => {
    expect(new Polynomial([0, -1]).toString()).toBe('-x');
  });
  it('2x toString is "2x"', () => {
    expect(new Polynomial([0, 2]).toString()).toBe('2x');
  });
  it('x^2 toString is "x^2"', () => {
    expect(new Polynomial([0, 0, 1]).toString()).toBe('x^2');
  });
  it('x^2 + 1 toString is "x^2 + 1"', () => {
    expect(new Polynomial([1, 0, 1]).toString()).toBe('x^2 + 1');
  });
  it('x^2 - 1 toString is "x^2 - 1"', () => {
    expect(new Polynomial([-1, 0, 1]).toString()).toBe('x^2 - 1');
  });
  it('3x^2 + 2x + 1 toString is "3x^2 + 2x + 1"', () => {
    expect(new Polynomial([1, 2, 3]).toString()).toBe('3x^2 + 2x + 1');
  });
  it('custom variable toString uses provided variable', () => {
    expect(new Polynomial([0, 1]).toString('t')).toBe('t');
  });
  it('x^2 + x toString has no constant term', () => {
    expect(new Polynomial([0, 1, 1]).toString()).toBe('x^2 + x');
  });
  it('2x^2 - x + 3 toString', () => {
    expect(new Polynomial([3, -1, 2]).toString()).toBe('2x^2 - x + 3');
  });
  it('-x^2 toString is "-x^2"', () => {
    expect(new Polynomial([0, 0, -1]).toString()).toBe('-x^2');
  });

  // Loop: constant polynomials toString = String(n)
  for (let n = -5; n <= 5; n++) {
    if (n === 0) continue; // zero poly
    it(`constant(${n}).toString() === "${n}"`, () => {
      expect(new Polynomial([n]).toString()).toBe(String(n));
    });
  }

  // Loop: monomials x^n toString
  for (let n = 2; n <= 8; n++) {
    it(`monomial(1,${n}).toString() === "x^${n}"`, () => {
      expect(monomial(1, n).toString()).toBe(`x^${n}`);
    });
  }

  // Loop: scaled monomials
  for (let c = 2; c <= 5; c++) {
    it(`${c}*x^3 toString is "${c}x^3"`, () => {
      expect(monomial(c, 3).toString()).toBe(`${c}x^3`);
    });
  }

  // Loop: custom variable
  const vars = ['t', 'y', 'z', 'u'];
  for (const v of vars) {
    it(`x^2 with variable "${v}" gives "${v}^2"`, () => {
      expect(new Polynomial([0, 0, 1]).toString(v)).toBe(`${v}^2`);
    });
  }
});

// ---------------------------------------------------------------------------
// 12. equals
// ---------------------------------------------------------------------------

describe('Polynomial equals', () => {
  it('zero equals zero', () => {
    expect(new Polynomial([]).equals(new Polynomial([]))).toBe(true);
  });
  it('zero not equals non-zero', () => {
    expect(new Polynomial([]).equals(new Polynomial([1]))).toBe(false);
  });
  it('same coefficients are equal', () => {
    expect(new Polynomial([1, 2, 3]).equals(new Polynomial([1, 2, 3]))).toBe(true);
  });
  it('trailing zeros do not affect equality', () => {
    expect(new Polynomial([1, 2, 0]).equals(new Polynomial([1, 2]))).toBe(true);
  });
  it('different coefficients are not equal', () => {
    expect(new Polynomial([1, 2, 3]).equals(new Polynomial([1, 2, 4]))).toBe(false);
  });
  it('equality within epsilon', () => {
    const p = new Polynomial([1, 2]);
    const q = new Polynomial([1 + 1e-13, 2 - 1e-13]);
    expect(p.equals(q)).toBe(true);
  });
  it('not equal beyond epsilon', () => {
    const p = new Polynomial([1]);
    const q = new Polynomial([1 + 1e-9]);
    expect(p.equals(q, 1e-12)).toBe(false);
  });
  it('reflexive: p.equals(p)', () => {
    const p = new Polynomial([3, 1, 4, 1, 5]);
    expect(p.equals(p)).toBe(true);
  });
  it('symmetric: p.equals(q) iff q.equals(p)', () => {
    const p = new Polynomial([1, 2]);
    const q = new Polynomial([1, 2]);
    expect(p.equals(q)).toBe(q.equals(p));
  });

  // Loop: x^n equals x^n
  for (let n = 0; n <= 9; n++) {
    it(`x^${n} equals x^${n}`, () => {
      expect(monomial(1, n).equals(monomial(1, n))).toBe(true);
    });
  }

  // Loop: scaled polys
  const base = new Polynomial([1, 2, 3]);
  for (let s = -3; s <= 3; s++) {
    it(`base.scale(${s}).equals(base.scale(${s}))`, () => {
      expect(base.scale(s).equals(base.scale(s))).toBe(true);
    });
  }

  // Loop: distinct degrees not equal
  for (let d = 1; d <= 5; d++) {
    it(`x^${d} not equals x^${d - 1}`, () => {
      expect(monomial(1, d).equals(monomial(1, d - 1))).toBe(false);
    });
  }

  // Loop: custom epsilon
  for (let e = 1; e <= 8; e++) {
    const eps = Math.pow(10, -e);
    it(`equals within epsilon=1e-${e}`, () => {
      const p = new Polynomial([1]);
      const q = new Polynomial([1 + eps / 2]);
      expect(p.equals(q, eps)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 13. negate / isZero / pow
// ---------------------------------------------------------------------------

describe('Polynomial negate, isZero, pow', () => {
  it('negate of zero is zero', () => {
    expect(new Polynomial([]).negate().isZero()).toBe(true);
  });
  it('negate of 1 is -1', () => {
    expect(new Polynomial([1]).negate().equals(new Polynomial([-1]))).toBe(true);
  });
  it('negate twice returns original', () => {
    const p = new Polynomial([1, -2, 3]);
    expect(p.negate().negate().equals(p)).toBe(true);
  });
  it('p + negate(p) = zero', () => {
    const p = new Polynomial([1, 2, 3]);
    expect(p.add(p.negate()).isZero()).toBe(true);
  });
  it('isZero on [0,0] is true', () => {
    expect(new Polynomial([0, 0]).isZero()).toBe(true);
  });
  it('isZero on non-zero is false', () => {
    expect(new Polynomial([1]).isZero()).toBe(false);
  });

  // pow tests
  it('pow(0) = 1', () => {
    expect(new Polynomial([2, 3]).pow(0).equals(new Polynomial([1]))).toBe(true);
  });
  it('pow(1) = self', () => {
    const p = new Polynomial([1, 2]);
    expect(p.pow(1).equals(p)).toBe(true);
  });
  it('pow(2) = p*p', () => {
    const p = new Polynomial([1, 1]);
    expect(p.pow(2).equals(p.multiply(p))).toBe(true);
  });
  it('(x+1)^3 = x^3 + 3x^2 + 3x + 1', () => {
    const p = new Polynomial([1, 1]);
    const r = p.pow(3);
    expect(r.equals(new Polynomial([1, 3, 3, 1]))).toBe(true);
  });
  it('zero^0 = 1', () => {
    expect(new Polynomial([]).pow(0).equals(new Polynomial([1]))).toBe(true);
  });
  it('zero^1 = zero', () => {
    expect(new Polynomial([]).pow(1).isZero()).toBe(true);
  });
  it('pow throws on negative', () => {
    expect(() => new Polynomial([1]).pow(-1)).toThrow();
  });
  it('pow throws on non-integer', () => {
    expect(() => new Polynomial([1]).pow(1.5)).toThrow();
  });

  // Loop: (x)^n degree = n
  for (let n = 0; n <= 8; n++) {
    it(`x.pow(${n}) has degree ${n}`, () => {
      const x = new Polynomial([0, 1]);
      if (n === 0) {
        expect(x.pow(n).degree).toBe(0);
      } else {
        expect(x.pow(n).degree).toBe(n);
      }
    });
  }

  // Loop: constant(2)^n = 2^n
  for (let n = 0; n <= 7; n++) {
    it(`constant(2)^${n} = ${Math.pow(2, n)}`, () => {
      expect(new Polynomial([2]).pow(n).evaluate(0)).toBeCloseTo(Math.pow(2, n), 8);
    });
  }

  // Loop: (1+x)^n evaluated at x=1 is 2^n (binomial theorem)
  for (let n = 0; n <= 6; n++) {
    it(`(1+x)^${n} evaluated at x=1 is ${Math.pow(2, n)}`, () => {
      const p = new Polynomial([1, 1]);
      expect(p.pow(n).evaluate(1)).toBeCloseTo(Math.pow(2, n), 8);
    });
  }

  // Loop: negate coefficients
  for (let d = 0; d <= 4; d++) {
    it(`negate of x^${d} has coeff[${d}] = -1`, () => {
      expect(monomial(1, d).negate().coeff(d)).toBe(-1);
    });
  }
});

// ---------------------------------------------------------------------------
// 14. quadraticRoots
// ---------------------------------------------------------------------------

describe('quadraticRoots', () => {
  it('x^2 - 1 has roots -1, 1', () => {
    const r = quadraticRoots(1, 0, -1);
    expect(r).toHaveLength(2);
    expect(r[0]).toBeCloseTo(-1, 8);
    expect(r[1]).toBeCloseTo(1, 8);
  });
  it('x^2 - 4 has roots -2, 2', () => {
    const r = quadraticRoots(1, 0, -4);
    expect(r[0]).toBeCloseTo(-2, 8);
    expect(r[1]).toBeCloseTo(2, 8);
  });
  it('x^2 + 1 has no real roots', () => {
    expect(quadraticRoots(1, 0, 1)).toHaveLength(0);
  });
  it('x^2 - 2x + 1 = (x-1)^2 has repeated root 1', () => {
    const r = quadraticRoots(1, -2, 1);
    expect(r).toHaveLength(1);
    expect(r[0]).toBeCloseTo(1, 8);
  });
  it('2x^2 - 2 has roots -1, 1', () => {
    const r = quadraticRoots(2, 0, -2);
    expect(r[0]).toBeCloseTo(-1, 8);
    expect(r[1]).toBeCloseTo(1, 8);
  });
  it('a=0, b≠0 gives linear root', () => {
    const r = quadraticRoots(0, 2, -4); // 2x - 4 = 0 => x=2
    expect(r).toHaveLength(1);
    expect(r[0]).toBeCloseTo(2, 8);
  });
  it('a=0, b=0 gives no roots', () => {
    expect(quadraticRoots(0, 0, 5)).toHaveLength(0);
  });
  it('roots are sorted ascending', () => {
    const r = quadraticRoots(1, -5, 6); // (x-2)(x-3) = 0
    expect(r[0]).toBeLessThan(r[1]);
    expect(r[0]).toBeCloseTo(2, 8);
    expect(r[1]).toBeCloseTo(3, 8);
  });

  // Loop: x^2 - n^2 has roots ±n
  for (let n = 1; n <= 10; n++) {
    it(`x^2 - ${n * n} has roots ±${n}`, () => {
      const r = quadraticRoots(1, 0, -n * n);
      expect(r).toHaveLength(2);
      expect(r[0]).toBeCloseTo(-n, 8);
      expect(r[1]).toBeCloseTo(n, 8);
    });
  }

  // Loop: (x-a)(x-b) has roots a and b
  for (let a = -3; a <= 3; a++) {
    for (let b = a + 1; b <= 3; b++) {
      const A = 1;
      const B = -(a + b);
      const C = a * b;
      it(`(x-${a})(x-${b}) has roots ${a},${b}`, () => {
        const r = quadraticRoots(A, B, C);
        expect(r).toHaveLength(2);
        expect(r[0]).toBeCloseTo(Math.min(a, b), 6);
        expect(r[1]).toBeCloseTo(Math.max(a, b), 6);
      });
    }
  }

  // Loop: verify roots satisfy polynomial
  const quadCases = [[1, -3, 2], [1, 5, 6], [2, -4, 2], [1, -6, 9]];
  for (const [A, B, C] of quadCases) {
    it(`roots of ${A}x^2+${B}x+${C} satisfy the polynomial`, () => {
      const r = quadraticRoots(A, B, C);
      for (const root of r) {
        expect(Math.abs(A * root * root + B * root + C)).toBeLessThan(1e-8);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 15. lagrangeInterpolation
// ---------------------------------------------------------------------------

describe('lagrangeInterpolation', () => {
  it('empty points returns zero polynomial', () => {
    expect(lagrangeInterpolation([]).isZero()).toBe(true);
  });
  it('single point (2, 5) returns constant 5', () => {
    const p = lagrangeInterpolation([{ x: 2, y: 5 }]);
    expect(p.evaluate(0)).toBeCloseTo(5, 8);
    expect(p.evaluate(2)).toBeCloseTo(5, 8);
  });
  it('two points determine a linear polynomial', () => {
    const p = lagrangeInterpolation([{ x: 0, y: 1 }, { x: 1, y: 3 }]);
    expect(p.evaluate(0)).toBeCloseTo(1, 8);
    expect(p.evaluate(1)).toBeCloseTo(3, 8);
  });
  it('three points determine a quadratic', () => {
    const pts = [{ x: 0, y: 1 }, { x: 1, y: 4 }, { x: 2, y: 9 }];
    const p = lagrangeInterpolation(pts);
    for (const { x, y } of pts) {
      expect(p.evaluate(x)).toBeCloseTo(y, 6);
    }
  });
  it('interpolation through (0,0),(1,1),(2,4),(3,9) = x^2', () => {
    const pts = [0, 1, 2, 3].map((x) => ({ x, y: x * x }));
    const p = lagrangeInterpolation(pts);
    for (let x = 0; x <= 3; x++) {
      expect(p.evaluate(x)).toBeCloseTo(x * x, 6);
    }
  });
  it('interpolation through (0,0),(1,1),(2,8),(3,27) = x^3', () => {
    const pts = [0, 1, 2, 3].map((x) => ({ x, y: x ** 3 }));
    const p = lagrangeInterpolation(pts);
    for (let x = 0; x <= 3; x++) {
      expect(p.evaluate(x)).toBeCloseTo(x ** 3, 5);
    }
  });

  // Loop: interpolation passes through all given points for x=0..4 (y=x^2)
  for (let x = 0; x <= 4; x++) {
    it(`lagrange interpolation of y=x^2 passes through x=${x}`, () => {
      const pts = [0, 1, 2, 3, 4].map((xi) => ({ x: xi, y: xi * xi }));
      const p = lagrangeInterpolation(pts);
      expect(p.evaluate(x)).toBeCloseTo(x * x, 5);
    });
  }

  // Loop: constant function y=7 through n points
  for (let n = 1; n <= 5; n++) {
    it(`lagrange for constant y=7 through ${n} points evaluates to 7`, () => {
      const pts = Array.from({ length: n }, (_, i) => ({ x: i, y: 7 }));
      const p = lagrangeInterpolation(pts);
      expect(p.evaluate(0.5)).toBeCloseTo(7, 6);
    });
  }

  // Loop: linear function y=2x+1 through 2 points
  for (let a = 0; a <= 5; a++) {
    for (let b = a + 1; b <= 6; b++) {
      it(`lagrange for y=2x+1 through x=${a},${b}`, () => {
        const pts = [a, b].map((x) => ({ x, y: 2 * x + 1 }));
        const p = lagrangeInterpolation(pts);
        expect(p.evaluate(a)).toBeCloseTo(2 * a + 1, 6);
        expect(p.evaluate(b)).toBeCloseTo(2 * b + 1, 6);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 16. chebyshev
// ---------------------------------------------------------------------------

describe('chebyshev polynomials', () => {
  it('T_0(x) = 1', () => {
    const T0 = chebyshev(0);
    expect(T0.evaluate(0)).toBeCloseTo(1, 8);
    expect(T0.evaluate(5)).toBeCloseTo(1, 8);
  });
  it('T_1(x) = x', () => {
    const T1 = chebyshev(1);
    expect(T1.evaluate(3)).toBeCloseTo(3, 8);
    expect(T1.evaluate(-2)).toBeCloseTo(-2, 8);
  });
  it('T_2(x) = 2x^2 - 1', () => {
    const T2 = chebyshev(2);
    expect(T2.equals(new Polynomial([-1, 0, 2]))).toBe(true);
  });
  it('T_3(x) = 4x^3 - 3x', () => {
    const T3 = chebyshev(3);
    expect(T3.evaluate(0)).toBeCloseTo(0, 8);
    expect(T3.evaluate(1)).toBeCloseTo(1, 8);
  });
  it('T_n(1) = 1 for all n', () => {
    for (let n = 0; n <= 5; n++) {
      expect(chebyshev(n).evaluate(1)).toBeCloseTo(1, 8);
    }
  });
  it('T_n(-1) = (-1)^n', () => {
    for (let n = 0; n <= 5; n++) {
      expect(chebyshev(n).evaluate(-1)).toBeCloseTo(Math.pow(-1, n), 8);
    }
  });
  it('chebyshev throws on negative n', () => {
    expect(() => chebyshev(-1)).toThrow();
  });
  it('T_n(0) alternates sign: T_0=1, T_2=-1, T_4=1', () => {
    expect(chebyshev(0).evaluate(0)).toBeCloseTo(1, 8);
    expect(chebyshev(2).evaluate(0)).toBeCloseTo(-1, 8);
    expect(chebyshev(4).evaluate(0)).toBeCloseTo(1, 8);
  });

  // Loop: T_n satisfies three-term recurrence T_{n+1} = 2x*T_n - T_{n-1}
  const twoX = new Polynomial([0, 2]);
  for (let n = 1; n <= 8; n++) {
    it(`chebyshev recurrence holds for n=${n}`, () => {
      const Tn = chebyshev(n);
      const Tnm1 = chebyshev(n - 1);
      const Tnp1 = chebyshev(n + 1);
      const rhs = twoX.multiply(Tn).subtract(Tnm1);
      expect(Tnp1.equals(rhs, 1e-9)).toBe(true);
    });
  }

  // Loop: T_n evaluated at cos(k*pi/n) should be cos(k*pi) for k=0..n
  for (let n = 1; n <= 5; n++) {
    it(`chebyshev T_${n}(cos(pi/${n})) ≈ cos(pi) = -1`, () => {
      const T = chebyshev(n);
      const x = Math.cos(Math.PI / n);
      expect(T.evaluate(x)).toBeCloseTo(Math.cos(Math.PI), 6);
    });
  }

  // Loop: degree of T_n is n
  for (let n = 0; n <= 9; n++) {
    it(`chebyshev T_${n} has degree ${n}`, () => {
      expect(chebyshev(n).degree).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// 17. legendre
// ---------------------------------------------------------------------------

describe('legendre polynomials', () => {
  it('P_0(x) = 1', () => {
    const P0 = legendre(0);
    expect(P0.evaluate(0)).toBeCloseTo(1, 8);
    expect(P0.evaluate(99)).toBeCloseTo(1, 8);
  });
  it('P_1(x) = x', () => {
    const P1 = legendre(1);
    expect(P1.evaluate(3)).toBeCloseTo(3, 8);
    expect(P1.evaluate(-5)).toBeCloseTo(-5, 8);
  });
  it('P_2(x) = (3x^2 - 1)/2', () => {
    const P2 = legendre(2);
    expect(P2.evaluate(0)).toBeCloseTo(-0.5, 8);
    expect(P2.evaluate(1)).toBeCloseTo(1, 8);
  });
  it('P_3(x) = (5x^3 - 3x)/2', () => {
    const P3 = legendre(3);
    expect(P3.evaluate(0)).toBeCloseTo(0, 8);
    expect(P3.evaluate(1)).toBeCloseTo(1, 8);
  });
  it('P_n(1) = 1 for all n', () => {
    for (let n = 0; n <= 5; n++) {
      expect(legendre(n).evaluate(1)).toBeCloseTo(1, 6);
    }
  });
  it('P_n(-1) = (-1)^n', () => {
    for (let n = 0; n <= 5; n++) {
      expect(legendre(n).evaluate(-1)).toBeCloseTo(Math.pow(-1, n), 6);
    }
  });
  it('legendre throws on negative n', () => {
    expect(() => legendre(-1)).toThrow();
  });

  // Loop: degree of P_n is n
  for (let n = 0; n <= 9; n++) {
    it(`legendre P_${n} has degree ${n}`, () => {
      expect(legendre(n).degree).toBe(n);
    });
  }

  // Loop: Bonnet's recurrence: (n+1)P_{n+1} = (2n+1)xP_n - nP_{n-1}
  const xPoly = new Polynomial([0, 1]);
  for (let n = 1; n <= 6; n++) {
    it(`legendre Bonnet recurrence holds for n=${n}`, () => {
      const Pn = legendre(n);
      const Pnm1 = legendre(n - 1);
      const Pnp1 = legendre(n + 1);
      const rhs = xPoly.multiply(Pn).scale((2 * n + 1) / (n + 1))
                       .subtract(Pnm1.scale(n / (n + 1)));
      expect(Pnp1.equals(rhs, 1e-9)).toBe(true);
    });
  }

  // Loop: P_n(0) = 0 for odd n
  for (let n = 1; n <= 7; n += 2) {
    it(`P_${n}(0) = 0 (odd Legendre)`, () => {
      expect(legendre(n).evaluate(0)).toBeCloseTo(0, 8);
    });
  }
});

// ---------------------------------------------------------------------------
// 18. newtonInterpolation
// ---------------------------------------------------------------------------

describe('newtonInterpolation', () => {
  it('empty input returns zero polynomial', () => {
    expect(newtonInterpolation([], []).isZero()).toBe(true);
  });
  it('throws on mismatched lengths', () => {
    expect(() => newtonInterpolation([1, 2], [1])).toThrow();
  });
  it('single point interpolation', () => {
    const p = newtonInterpolation([5], [3]);
    expect(p.evaluate(5)).toBeCloseTo(3, 8);
  });
  it('two points give linear polynomial', () => {
    const p = newtonInterpolation([0, 1], [1, 3]);
    expect(p.evaluate(0)).toBeCloseTo(1, 8);
    expect(p.evaluate(1)).toBeCloseTo(3, 8);
  });
  it('agrees with lagrange for three points', () => {
    const xs = [0, 1, 2];
    const ys = [1, 4, 9];
    const pN = newtonInterpolation(xs, ys);
    const pL = lagrangeInterpolation(xs.map((x, i) => ({ x, y: ys[i] })));
    for (let x = 0; x <= 2; x++) {
      expect(pN.evaluate(x)).toBeCloseTo(pL.evaluate(x), 6);
    }
  });
  it('interpolates y=x^2 at x=0,1,2,3', () => {
    const xs = [0, 1, 2, 3];
    const ys = xs.map((x) => x * x);
    const p = newtonInterpolation(xs, ys);
    for (let i = 0; i < xs.length; i++) {
      expect(p.evaluate(xs[i])).toBeCloseTo(ys[i], 6);
    }
  });

  // Loop: interpolation passes through each of y=x^3 points
  const cubicXs = [0, 1, 2, 3, 4];
  const cubicYs = cubicXs.map((x) => x ** 3);
  const cubicP = newtonInterpolation(cubicXs, cubicYs);
  for (let i = 0; i < cubicXs.length; i++) {
    it(`newton cubic interpolation passes through (${cubicXs[i]}, ${cubicYs[i]})`, () => {
      expect(cubicP.evaluate(cubicXs[i])).toBeCloseTo(cubicYs[i], 5);
    });
  }

  // Loop: constant function y=4 through n points
  for (let n = 1; n <= 5; n++) {
    it(`newton constant y=4 through ${n} points evaluates to 4 at x=0.5`, () => {
      const xs2 = Array.from({ length: n }, (_, i) => i);
      const ys2 = xs2.map(() => 4);
      const p = newtonInterpolation(xs2, ys2);
      expect(p.evaluate(0.5)).toBeCloseTo(4, 6);
    });
  }

  // Loop: linear function y=3x-1 through equispaced points
  for (let n = 2; n <= 5; n++) {
    it(`newton linear y=3x-1 through ${n} points`, () => {
      const xs2 = Array.from({ length: n }, (_, i) => i);
      const ys2 = xs2.map((x) => 3 * x - 1);
      const p = newtonInterpolation(xs2, ys2);
      expect(p.evaluate(0)).toBeCloseTo(-1, 6);
      expect(p.evaluate(1)).toBeCloseTo(2, 6);
    });
  }

  // Loop: verify newton = lagrange for various polynomials
  const verifyPolys = [
    [1, 2, 3],       // 1 + 2x + 3x^2
    [0, 0, 1],       // x^2
    [5, -3, 1],      // 5 - 3x + x^2
  ];
  for (let pi = 0; pi < verifyPolys.length; pi++) {
    it(`newton matches lagrange for test poly ${pi}`, () => {
      const refPoly = new Polynomial(verifyPolys[pi]);
      const sampleXs = [0, 1, 2, 3];
      const sampleYs = sampleXs.map((x) => refPoly.evaluate(x));
      const interp = newtonInterpolation(sampleXs, sampleYs);
      for (const x of sampleXs) {
        expect(interp.evaluate(x)).toBeCloseTo(refPoly.evaluate(x), 5);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 19. Factory functions
// ---------------------------------------------------------------------------

describe('Factory functions', () => {
  // poly(...)
  it('poly() = zero polynomial', () => {
    expect(poly().isZero()).toBe(true);
  });
  it('poly(5) = constant 5', () => {
    expect(poly(5).equals(new Polynomial([5]))).toBe(true);
  });
  it('poly(1, 2, 3) = 1 + 2x + 3x^2', () => {
    expect(poly(1, 2, 3).equals(new Polynomial([1, 2, 3]))).toBe(true);
  });

  // monomial
  it('monomial(1, 0) = constant 1', () => {
    expect(monomial(1, 0).equals(new Polynomial([1]))).toBe(true);
  });
  it('monomial(3, 2) = 3x^2', () => {
    expect(monomial(3, 2).evaluate(2)).toBeCloseTo(12, 8);
  });
  it('monomial throws on negative degree', () => {
    expect(() => monomial(1, -1)).toThrow();
  });
  it('monomial(0, 5) = zero polynomial', () => {
    expect(monomial(0, 5).isZero()).toBe(true);
  });

  // constant
  it('constant(0) is zero polynomial', () => {
    expect(constant(0).isZero()).toBe(true);
  });
  it('constant(7) evaluates to 7 everywhere', () => {
    const p = constant(7);
    for (let x = -3; x <= 3; x++) {
      expect(p.evaluate(x)).toBe(7);
    }
  });

  // linear
  it('linear(2, 3) = 2x + 3', () => {
    const p = linear(2, 3);
    expect(p.evaluate(0)).toBe(3);
    expect(p.evaluate(1)).toBe(5);
    expect(p.evaluate(-1)).toBe(1);
  });
  it('linear(0, c) = constant c', () => {
    expect(linear(0, 4).equals(constant(4))).toBe(true);
  });

  // quadratic
  it('quadratic(1, 0, -1) = x^2 - 1', () => {
    const p = quadratic(1, 0, -1);
    expect(p.evaluate(1)).toBe(0);
    expect(p.evaluate(-1)).toBe(0);
  });
  it('quadratic(1, -2, 1) = (x-1)^2', () => {
    const p = quadratic(1, -2, 1);
    expect(p.evaluate(1)).toBe(0);
    expect(p.evaluate(0)).toBe(1);
  });
  it('quadratic(0, 2, 3) = 2x + 3', () => {
    const p = quadratic(0, 2, 3);
    expect(p.degree).toBe(1);
    expect(p.evaluate(1)).toBe(5);
  });

  // Loop: monomial(c, n) has degree n
  for (let n = 0; n <= 8; n++) {
    it(`monomial(1, ${n}) has degree ${n}`, () => {
      expect(monomial(1, n).degree).toBe(n);
    });
  }

  // Loop: linear(a, b) evaluate
  for (let a = -3; a <= 3; a++) {
    for (let b = -2; b <= 2; b++) {
      it(`linear(${a},${b}) at x=1 is ${a + b}`, () => {
        expect(linear(a, b).evaluate(1)).toBe(a + b);
      });
    }
  }

  // Loop: constant(c) degree
  for (let c = 1; c <= 5; c++) {
    it(`constant(${c}) has degree 0`, () => {
      expect(constant(c).degree).toBe(0);
    });
  }

  // Loop: poly(a, b) is same as linear(b, a)
  for (let a = -2; a <= 2; a++) {
    for (let b = -2; b <= 2; b++) {
      it(`poly(${a},${b}) equals linear(${b},${a})`, () => {
        expect(poly(a, b).equals(linear(b, a))).toBe(true);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 20. Edge cases: zero polynomial, degree-0, degree-1
// ---------------------------------------------------------------------------

describe('Edge cases', () => {
  it('zero polynomial degree is -Infinity', () => {
    expect(new Polynomial([]).degree).toBe(-Infinity);
  });
  it('zero polynomial evaluate returns 0', () => {
    expect(new Polynomial([]).evaluate(999)).toBe(0);
  });
  it('zero polynomial add zero is zero', () => {
    expect(new Polynomial([]).add(new Polynomial([])).isZero()).toBe(true);
  });
  it('zero polynomial subtract zero is zero', () => {
    expect(new Polynomial([]).subtract(new Polynomial([])).isZero()).toBe(true);
  });
  it('zero polynomial multiply is zero', () => {
    expect(new Polynomial([]).multiply(new Polynomial([1])).isZero()).toBe(true);
  });
  it('zero polynomial derivative is zero', () => {
    expect(new Polynomial([]).derivative().isZero()).toBe(true);
  });
  it('zero polynomial negate is zero', () => {
    expect(new Polynomial([]).negate().isZero()).toBe(true);
  });
  it('zero polynomial scale is zero', () => {
    expect(new Polynomial([]).scale(5).isZero()).toBe(true);
  });
  it('zero polynomial toString is "0"', () => {
    expect(new Polynomial([]).toString()).toBe('0');
  });
  it('zero polynomial equals zero polynomial', () => {
    expect(new Polynomial([]).equals(new Polynomial([]))).toBe(true);
  });
  it('constant polynomial coeff(0) is the constant', () => {
    expect(new Polynomial([42]).coeff(0)).toBe(42);
  });
  it('constant polynomial coeff(1) is 0', () => {
    expect(new Polynomial([42]).coeff(1)).toBe(0);
  });
  it('degree-1 polynomial evaluated at root is zero', () => {
    const p = linear(2, -4); // 2x - 4, root at x=2
    expect(p.evaluate(2)).toBeCloseTo(0, 8);
  });
  it('derivative of linear is constant', () => {
    const p = linear(3, 7); // 3x + 7
    const d = p.derivative();
    expect(d.degree).toBe(0);
    expect(d.coeff(0)).toBe(3);
  });
  it('integral of constant adds x term', () => {
    const p = constant(6).integral();
    expect(p.degree).toBe(1);
    expect(p.coeff(1)).toBe(6);
  });

  // Loop: polynomial of single non-zero coefficient
  for (let c = -5; c <= 5; c++) {
    if (c === 0) continue;
    it(`single-coeff polynomial [${c}] has degree 0`, () => {
      expect(new Polynomial([c]).degree).toBe(0);
    });
  }

  // Loop: large coefficients
  for (let e = 1; e <= 6; e++) {
    const large = Math.pow(10, e);
    it(`polynomial with coefficient 1e${e} evaluates correctly at x=1`, () => {
      const p = new Polynomial([large]);
      expect(p.evaluate(1)).toBe(large);
    });
  }

  // Loop: negative coefficients
  for (let d = 0; d <= 4; d++) {
    it(`polynomial with all negative coeffs degree ${d}`, () => {
      const c = new Array<number>(d + 1).fill(-1);
      const p = new Polynomial(c);
      expect(p.degree).toBe(d);
    });
  }

  // Loop: polynomial trimming for various trailing zero lengths
  for (let n = 1; n <= 5; n++) {
    it(`trimming ${n} trailing zeros from [1, 0...0]`, () => {
      const c = [1, ...new Array(n).fill(0)];
      expect(new Polynomial(c).degree).toBe(0);
    });
  }

  // Loop: zero polynomial coeff(n) = 0 for all n
  for (let n = 0; n <= 9; n++) {
    it(`zero polynomial coeff(${n}) = 0`, () => {
      expect(new Polynomial([]).coeff(n)).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 21. static gcd
// ---------------------------------------------------------------------------

describe('Polynomial.gcd', () => {
  it('gcd(p, zero) = monic(p)', () => {
    const p = new Polynomial([2, 4]); // 2 + 4x = 2(1+2x)
    const g = Polynomial.gcd(p, new Polynomial([]));
    // gcd should be monic version
    expect(g.evaluate(0)).toBeCloseTo(p.evaluate(0) / p.coeff(1), 6);
  });
  it('gcd(zero, p) = monic(p)', () => {
    const p = new Polynomial([3, 6]); // 3 + 6x
    const g = Polynomial.gcd(new Polynomial([]), p);
    expect(g.coeff(1)).toBeCloseTo(1, 8); // monic
  });
  it('gcd(p, p) = monic(p)', () => {
    const p = new Polynomial([2, 0, 2]); // 2 + 2x^2
    const g = Polynomial.gcd(p, p);
    expect(g.coeff(2)).toBeCloseTo(1, 8); // leading coeff = 1
  });
  it('gcd of coprime polynomials is 1', () => {
    const p = new Polynomial([-1, 1]); // x - 1
    const q = new Polynomial([1, 1]);  // x + 1
    const g = Polynomial.gcd(p, q);
    expect(g.degree).toBe(0); // constant
  });
  it('gcd of (x-1)^2 and (x-1)(x+1) is (x-1)', () => {
    const xm1 = new Polynomial([-1, 1]);
    const xp1 = new Polynomial([1, 1]);
    const a = xm1.multiply(xm1); // (x-1)^2
    const b = xm1.multiply(xp1); // (x-1)(x+1) = x^2-1
    const g = Polynomial.gcd(a, b);
    // g should be monic multiple of (x-1), degree 1
    expect(g.degree).toBe(1);
    expect(g.evaluate(1)).toBeCloseTo(0, 8); // root at x=1
  });

  // Loop: gcd(k*p, p) = monic(p) for various k
  const baseGcd = new Polynomial([1, 2, 1]); // (1+x)^2
  for (let k = 1; k <= 5; k++) {
    it(`gcd(${k}*p, p) is monic(p)`, () => {
      const scaled = baseGcd.scale(k);
      const g = Polynomial.gcd(scaled, baseGcd);
      // Leading coefficient of gcd should be 1
      expect(Math.abs(g.coeff(g.degree as number))).toBeCloseTo(1, 6);
    });
  }

  // Loop: gcd of x^n and x^m is x^min(n,m)
  for (let n = 1; n <= 4; n++) {
    for (let m = 1; m <= 4; m++) {
      it(`gcd(x^${n}, x^${m}) has degree ${Math.min(n, m)}`, () => {
        const pn = monomial(1, n);
        const pm = monomial(1, m);
        const g = Polynomial.gcd(pn, pm);
        expect(g.degree).toBe(Math.min(n, m));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 22. realRoots
// ---------------------------------------------------------------------------

describe('Polynomial realRoots', () => {
  it('zero polynomial has no roots', () => {
    expect(new Polynomial([]).realRoots()).toEqual([]);
  });
  it('constant non-zero has no roots', () => {
    expect(new Polynomial([5]).realRoots()).toEqual([]);
  });
  it('linear polynomial has one root', () => {
    const roots = new Polynomial([-2, 1]).realRoots(); // x - 2
    expect(roots).toHaveLength(1);
    expect(roots[0]).toBeCloseTo(2, 6);
  });
  it('x^2 - 4 has roots ±2', () => {
    const roots = new Polynomial([-4, 0, 1]).realRoots();
    expect(roots).toHaveLength(2);
    expect(roots[0]).toBeCloseTo(-2, 5);
    expect(roots[1]).toBeCloseTo(2, 5);
  });
  it('x^2 + 1 has no real roots', () => {
    const roots = new Polynomial([1, 0, 1]).realRoots();
    expect(roots).toHaveLength(0);
  });
  it('(x-1)(x-2)(x-3) has roots 1,2,3', () => {
    const p = new Polynomial([-1, 1]).multiply(new Polynomial([-2, 1])).multiply(new Polynomial([-3, 1]));
    const roots = p.realRoots(1e-8);
    expect(roots).toHaveLength(3);
    expect(roots[0]).toBeCloseTo(1, 4);
    expect(roots[1]).toBeCloseTo(2, 4);
    expect(roots[2]).toBeCloseTo(3, 4);
  });
  it('roots satisfy p(root) ≈ 0', () => {
    const p = new Polynomial([-6, 11, -6, 1]); // (x-1)(x-2)(x-3)
    const roots = p.realRoots(1e-8);
    for (const r of roots) {
      expect(Math.abs(p.evaluate(r))).toBeLessThan(1e-5);
    }
  });

  // Loop: x^2 - n^2 has roots ±n
  for (let n = 1; n <= 5; n++) {
    it(`x^2 - ${n * n} roots are ±${n}`, () => {
      const p = new Polynomial([-n * n, 0, 1]);
      const roots = p.realRoots(1e-8);
      expect(roots).toHaveLength(2);
      expect(roots[0]).toBeCloseTo(-n, 4);
      expect(roots[1]).toBeCloseTo(n, 4);
    });
  }

  // Loop: x^2 + bx (root at 0 and -b)
  for (let b = 1; b <= 5; b++) {
    it(`x^2 + ${b}x has roots 0 and -${b}`, () => {
      const p = new Polynomial([0, b, 1]); // bx + x^2
      const roots = p.realRoots(1e-8);
      expect(roots).toHaveLength(2);
      expect(roots.some((r) => near(r, 0, 1e-4))).toBe(true);
      expect(roots.some((r) => near(r, -b, 1e-4))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 23. Horner evaluation correctness (extended)
// ---------------------------------------------------------------------------

describe('Horner evaluation extended', () => {
  // Loop: arbitrary polynomial evaluated at many x values
  const hPoly = new Polynomial([2, -3, 0, 5, -1]); // 2 - 3x + 5x^3 - x^4
  for (let x = -4; x <= 4; x++) {
    it(`Horner: (2-3x+5x^3-x^4) at x=${x}`, () => {
      const expected = 2 - 3 * x + 5 * x ** 3 - x ** 4;
      expect(hPoly.evaluate(x)).toBeCloseTo(expected, 8);
    });
  }

  // Loop: single-term polynomials
  for (let d = 0; d <= 5; d++) {
    for (let c = -2; c <= 2; c++) {
      if (c === 0) continue;
      it(`${c}*x^${d} at x=2 = ${c * Math.pow(2, d)}`, () => {
        const p = monomial(c, d);
        expect(p.evaluate(2)).toBeCloseTo(c * Math.pow(2, d), 8);
      });
    }
  }

  // Loop: p evaluated at fractional x
  const fracPoly = new Polynomial([1, 2, 1]); // (1+x)^2
  const fracXs = [0.5, 0.25, 0.1, 0.75, 1.5, 2.5];
  for (const x of fracXs) {
    it(`(1+x)^2 at x=${x} is ${(1 + x) ** 2}`, () => {
      expect(fracPoly.evaluate(x)).toBeCloseTo((1 + x) ** 2, 8);
    });
  }
});

// ---------------------------------------------------------------------------
// 24. Arithmetic identities
// ---------------------------------------------------------------------------

describe('Arithmetic identities', () => {
  // Loop: (a*x + b) * (c*x + d) = ac*x^2 + (ad+bc)*x + bd
  const quadTrials = [
    [1, 2, 3, 4],
    [2, 0, 0, 5],
    [-1, 3, 2, -1],
    [5, 5, 5, 5],
    [1, -1, 1, 1],
  ];
  for (const [a, b, c, d] of quadTrials) {
    it(`(${a}x+${b})*(${c}x+${d}) = ${a * c}x^2+${a * d + b * c}x+${b * d}`, () => {
      const p = linear(a, b);
      const q = linear(c, d);
      const r = p.multiply(q);
      expect(r.coeff(2)).toBeCloseTo(a * c, 8);
      expect(r.coeff(1)).toBeCloseTo(a * d + b * c, 8);
      expect(r.coeff(0)).toBeCloseTo(b * d, 8);
    });
  }

  // Loop: scale then add = add then scale (linearity)
  const linBase = new Polynomial([1, 2, 3]);
  const linOther = new Polynomial([4, 5, 6]);
  for (let s = -3; s <= 3; s++) {
    it(`scale then add: (${s}*p + ${s}*q) === ${s}*(p+q)`, () => {
      const lhs = linBase.scale(s).add(linOther.scale(s));
      const rhs = linBase.add(linOther).scale(s);
      expect(lhs.equals(rhs)).toBe(true);
    });
  }

  // Loop: (p-q)^2 = p^2 - 2pq + q^2
  const testPairs = [
    [new Polynomial([1, 1]), new Polynomial([1, -1])],
    [new Polynomial([2, 3]), new Polynomial([1, 2])],
    [new Polynomial([0, 1]), new Polynomial([1, 0])],
  ];
  for (let i = 0; i < testPairs.length; i++) {
    const [pp, qq] = testPairs[i];
    it(`(p${i}-q${i})^2 = p^2 - 2pq + q^2`, () => {
      const lhs = pp.subtract(qq).pow(2);
      const rhs = pp.pow(2).subtract(pp.multiply(qq).scale(2)).add(qq.pow(2));
      expect(lhs.equals(rhs, 1e-9)).toBe(true);
    });
  }

  // Loop: derivative of sum = sum of derivatives
  const sumDerivPolys = [
    [new Polynomial([1, 2, 3]), new Polynomial([4, 5])],
    [new Polynomial([0, 0, 1]), new Polynomial([1])],
    [new Polynomial([7, -3, 2, 1]), new Polynomial([1, -1])],
  ];
  for (let i = 0; i < sumDerivPolys.length; i++) {
    const [ap, bp] = sumDerivPolys[i];
    it(`d(p${i}+q${i})/dx = dp/dx + dq/dx`, () => {
      const lhs = ap.add(bp).derivative();
      const rhs = ap.derivative().add(bp.derivative());
      expect(lhs.equals(rhs)).toBe(true);
    });
  }

  // Loop: integral then derivative = identity (for non-zero polynomials)
  const intDerivPolys = [
    new Polynomial([1, 2, 3, 4]),
    new Polynomial([5]),
    new Polynomial([0, 1]),
    new Polynomial([3, -2, 1]),
    new Polynomial([0, 0, 0, 1]),
  ];
  for (let i = 0; i < intDerivPolys.length; i++) {
    it(`d/dx(integral of p${i}) = p${i}`, () => {
      expect(intDerivPolys[i].integral().derivative().equals(intDerivPolys[i])).toBe(true);
    });
  }

  // Loop: pow(n) evaluated at x = evaluate(x)^n
  const evalPowBase = new Polynomial([2, 1]); // 2+x
  for (let n = 0; n <= 5; n++) {
    for (let x = -2; x <= 2; x++) {
      it(`(2+x)^${n} at x=${x} equals ${Math.pow(evalPowBase.evaluate(x), n).toFixed(2)}`, () => {
        expect(evalPowBase.pow(n).evaluate(x)).toBeCloseTo(Math.pow(evalPowBase.evaluate(x), n), 8);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 25. Additional divmod / GCD stress tests
// ---------------------------------------------------------------------------

describe('divmod and GCD stress tests', () => {
  // Loop: (x-a)^2 divmod (x-a) has zero remainder
  for (let a = -4; a <= 4; a++) {
    it(`(x-${a})^2 divmod (x-${a}) has zero remainder`, () => {
      const xma = new Polynomial([-a, 1]);
      const { remainder } = xma.pow(2).divmod(xma);
      expect(remainder.isZero()).toBe(true);
    });
  }

  // Loop: gcd of two linear polynomials sharing one root
  for (let r = -3; r <= 3; r++) {
    it(`gcd of (x-${r})*(x+1) and (x-${r})*(x-2) has root ${r}`, () => {
      const xmr = new Polynomial([-r, 1]);
      const xp1 = new Polynomial([1, 1]);
      const xm2 = new Polynomial([-2, 1]);
      const a = xmr.multiply(xp1);
      const b = xmr.multiply(xm2);
      const g = Polynomial.gcd(a, b);
      // g is monic with root r (degree 1 when r ≠ -1 and r ≠ 2)
      expect(Math.abs(g.evaluate(r))).toBeLessThan(1e-6);
    });
  }

  // Loop: remainder of p divmod constant is zero
  for (let c = 1; c <= 5; c++) {
    it(`any polynomial divmod constant(${c}) has zero remainder`, () => {
      const p = new Polynomial([1, 2, 3, 4]);
      const { remainder } = p.divmod(new Polynomial([c]));
      expect(remainder.isZero()).toBe(true);
    });
  }

  // Loop: divmod quotient evaluation
  const divNum = new Polynomial([1, 0, 0, 1]); // 1 + x^3 = (x+1)(x^2-x+1)
  const divDen = new Polynomial([1, 1]);        // x + 1
  const { quotient: divQ, remainder: divR } = divNum.divmod(divDen);
  for (let x = -3; x <= 3; x++) {
    it(`(1+x^3) / (x+1): verify at x=${x}`, () => {
      const reconstruct = divDen.evaluate(x) * divQ.evaluate(x) + divR.evaluate(x);
      expect(reconstruct).toBeCloseTo(divNum.evaluate(x), 8);
    });
  }
});

// ---------------------------------------------------------------------------
// 26. Compose extended
// ---------------------------------------------------------------------------

describe('Compose extended', () => {
  // Loop: (x^2).compose(x^2) = x^4
  it('(x^2).compose(x^2) = x^4', () => {
    const x2 = monomial(1, 2);
    expect(x2.compose(x2).equals(monomial(1, 4))).toBe(true);
  });

  // Loop: linear composed with linear
  for (let a = -2; a <= 2; a++) {
    for (let b = -2; b <= 2; b++) {
      it(`(x+${a}).compose(x+${b}) = x + ${a + b}`, () => {
        const f = linear(1, a);
        const g = linear(1, b);
        const fg = f.compose(g);
        // f(g(x)) = g(x) + a = (x+b) + a = x + (a+b)
        expect(fg.equals(linear(1, a + b))).toBe(true);
      });
    }
  }

  // Loop: compose then evaluate
  const compF = new Polynomial([0, 0, 1]); // x^2
  const compG = new Polynomial([1, 1]);    // 1+x
  const compFG = compF.compose(compG);
  for (let x = -3; x <= 3; x++) {
    it(`(x^2).compose(1+x) at x=${x} = ${(1 + x) ** 2}`, () => {
      expect(compFG.evaluate(x)).toBeCloseTo((1 + x) ** 2, 8);
    });
  }

  // Loop: p.compose(zero) = p(0)
  const compPolys = [
    new Polynomial([3, 2, 1]),
    new Polynomial([5]),
    new Polynomial([0, 1, 0, 1]),
  ];
  for (let i = 0; i < compPolys.length; i++) {
    it(`p${i}.compose(zero) = constant ${compPolys[i].evaluate(0)}`, () => {
      const result = compPolys[i].compose(new Polynomial([]));
      expect(result.evaluate(0)).toBeCloseTo(compPolys[i].evaluate(0), 8);
    });
  }
});

// ---------------------------------------------------------------------------
// 27. toString edge cases extended
// ---------------------------------------------------------------------------

describe('toString edge cases extended', () => {
  // Loop: negative constant term — toString shows " - N" form
  for (let c = -5; c <= -1; c++) {
    it(`toString ends with " - ${-c}" for coeff ${c} at x^0`, () => {
      const p = new Polynomial([c, 0, 1]); // x^2 + c
      const s = p.toString();
      // negative c appears as " - N" where N = |c|
      expect(s).toContain(String(-c));
    });
  }

  // Loop: coefficients of 1 and -1 use compact form
  it('coefficient 1 on x^2 gives "x^2" not "1x^2"', () => {
    expect(new Polynomial([0, 0, 1]).toString()).toBe('x^2');
  });
  it('coefficient -1 on x^2 gives "-x^2" not "-1x^2"', () => {
    expect(new Polynomial([0, 0, -1]).toString()).toBe('-x^2');
  });
  it('coefficient 1 on x gives "x" not "1x"', () => {
    expect(new Polynomial([0, 1]).toString()).toBe('x');
  });
  it('coefficient -1 on x gives "-x" not "-1x"', () => {
    expect(new Polynomial([0, -1]).toString()).toBe('-x');
  });

  // Loop: multi-term polynomials with variable 'z'
  for (let d = 2; d <= 5; d++) {
    it(`degree-${d} monic polynomial with variable z contains "z^${d}"`, () => {
      const c = new Array<number>(d + 1).fill(0);
      c[d] = 1;
      const p = new Polynomial(c);
      expect(p.toString('z')).toBe(`z^${d}`);
    });
  }

  // Loop: toString and back — roundtrip degree is preserved
  const rtPolys = [
    new Polynomial([1]),
    new Polynomial([0, 1]),
    new Polynomial([1, 0, 1]),
    new Polynomial([1, 2, 3]),
    new Polynomial([-1, 0, 2, -3]),
  ];
  for (let i = 0; i < rtPolys.length; i++) {
    it(`toString round-trip: degree preserved for poly ${i}`, () => {
      const p = rtPolys[i];
      const s = p.toString();
      expect(typeof s).toBe('string');
      expect(s.length).toBeGreaterThan(0);
      // degree info: leading term should appear
      const deg = p.degree;
      if (deg === 0) {
        expect(s).not.toContain('x');
      } else {
        expect(s).toContain('x');
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 28. Integral/derivative exactness
// ---------------------------------------------------------------------------

describe('Integral and derivative exactness', () => {
  // Loop: integral of x^n / n+1 = x^(n+1)/(n+1)^2... let's check coeff
  for (let n = 0; n <= 8; n++) {
    it(`integral of ${n+1}*x^${n} = x^${n+1}`, () => {
      const p = monomial(n + 1, n);
      const I = p.integral();
      // coeff of x^(n+1) should be (n+1)/(n+1) = 1
      expect(I.coeff(n + 1)).toBeCloseTo(1, 8);
    });
  }

  // Loop: derivative of integral of each monomial = itself
  for (let n = 0; n <= 7; n++) {
    it(`d/dx(integral of x^${n}) = x^${n}`, () => {
      const p = monomial(1, n);
      expect(p.integral().derivative().equals(p)).toBe(true);
    });
  }

  // Loop: integral with constant c, evaluated at x=0 = c
  for (let c = -5; c <= 5; c++) {
    it(`integral of x with constant ${c} at x=0 is ${c}`, () => {
      const p = new Polynomial([0, 1]).integral(c);
      expect(p.evaluate(0)).toBe(c);
    });
  }
});

// ---------------------------------------------------------------------------
// 29. Scale and negate patterns
// ---------------------------------------------------------------------------

describe('Scale and negate patterns', () => {
  // Loop: scale(-1) = negate
  const scalePolys = [
    new Polynomial([1, 2, 3]),
    new Polynomial([0, 1]),
    new Polynomial([-3, 5]),
    new Polynomial([0, 0, 1]),
  ];
  for (let i = 0; i < scalePolys.length; i++) {
    it(`poly${i}.scale(-1) equals poly${i}.negate()`, () => {
      expect(scalePolys[i].scale(-1).equals(scalePolys[i].negate())).toBe(true);
    });
  }

  // Loop: scale(s).scale(1/s) = original (for s≠0)
  const scaleBase = new Polynomial([2, -1, 3]);
  for (let s = 1; s <= 6; s++) {
    it(`scale(${s}).scale(1/${s}) recovers original`, () => {
      expect(scaleBase.scale(s).scale(1 / s).equals(scaleBase, 1e-10)).toBe(true);
    });
  }

  // Loop: negate changes sign of all coefficients
  const negPoly = new Polynomial([1, -2, 3, -4]);
  for (let i = 0; i <= 3; i++) {
    it(`negate changes sign of coeff[${i}]`, () => {
      expect(negPoly.negate().coeff(i)).toBeCloseTo(-negPoly.coeff(i), 8);
    });
  }

  // Loop: scale by 0 gives zero
  const zeroScalePolys = [
    new Polynomial([1, 2, 3]),
    new Polynomial([5]),
    new Polynomial([0, 1, 0, 2]),
  ];
  for (let i = 0; i < zeroScalePolys.length; i++) {
    it(`scale(0) of poly${i} is zero`, () => {
      expect(zeroScalePolys[i].scale(0).isZero()).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 30. sub / mul aliases
// ---------------------------------------------------------------------------

describe('sub and mul aliases', () => {
  it('sub is an alias for subtract', () => {
    const p = new Polynomial([5, 3, 1]);
    const q = new Polynomial([2, 1]);
    expect(p.sub(q).equals(p.subtract(q))).toBe(true);
  });
  it('mul is an alias for multiply', () => {
    const p = new Polynomial([1, 2]);
    const q = new Polynomial([3, 4]);
    expect(p.mul(q).equals(p.multiply(q))).toBe(true);
  });
  it('p.sub(p) = zero', () => {
    const p = new Polynomial([1, 2, 3]);
    expect(p.sub(p).isZero()).toBe(true);
  });
  it('p.mul(1) = p', () => {
    const p = new Polynomial([4, 5, 6]);
    expect(p.mul(new Polynomial([1])).equals(p)).toBe(true);
  });
  it('p.mul(zero) = zero', () => {
    const p = new Polynomial([1, 2, 3]);
    expect(p.mul(new Polynomial([])).isZero()).toBe(true);
  });
  it('zero.sub(p) = -p', () => {
    const p = new Polynomial([1, 2]);
    expect(new Polynomial([]).sub(p).equals(p.negate())).toBe(true);
  });

  // Loop: sub correct evaluation
  const subP = new Polynomial([1, 2, 3]);
  const subQ = new Polynomial([4, 5]);
  for (let x = -3; x <= 3; x++) {
    it(`p.sub(q) at x=${x} matches p.subtract(q) at x=${x}`, () => {
      expect(subP.sub(subQ).evaluate(x)).toBeCloseTo(subP.subtract(subQ).evaluate(x), 8);
    });
  }

  // Loop: mul correct evaluation
  const mulP = new Polynomial([1, 1]);
  const mulQ = new Polynomial([2, 3]);
  for (let x = -3; x <= 3; x++) {
    it(`p.mul(q) at x=${x} matches p.multiply(q) at x=${x}`, () => {
      expect(mulP.mul(mulQ).evaluate(x)).toBeCloseTo(mulP.multiply(mulQ).evaluate(x), 8);
    });
  }

  // Loop: chain sub
  for (let n = 1; n <= 5; n++) {
    it(`sub chain: x^${n} sub x^${n} is zero`, () => {
      const m = monomial(1, n);
      expect(m.sub(m).isZero()).toBe(true);
    });
  }

  // Loop: chain mul with scale comparison
  for (let s = 1; s <= 5; s++) {
    it(`mul(constant(${s})) equals scale(${s})`, () => {
      const p = new Polynomial([1, 2, 3]);
      expect(p.mul(new Polynomial([s])).equals(p.scale(s))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 31. fromRoots static factory
// ---------------------------------------------------------------------------

describe('Polynomial.fromRoots', () => {
  it('fromRoots() with no args returns constant 1', () => {
    expect(Polynomial.fromRoots().equals(new Polynomial([1]))).toBe(true);
  });
  it('fromRoots(0) = x', () => {
    expect(Polynomial.fromRoots(0).equals(new Polynomial([0, 1]))).toBe(true);
  });
  it('fromRoots(1) = (x-1)', () => {
    const p = Polynomial.fromRoots(1);
    expect(p.evaluate(1)).toBeCloseTo(0, 8);
    expect(p.evaluate(0)).toBeCloseTo(-1, 8);
  });
  it('fromRoots(1, -1) evaluates to 0 at ±1', () => {
    const p = Polynomial.fromRoots(1, -1);
    expect(p.evaluate(1)).toBeCloseTo(0, 8);
    expect(p.evaluate(-1)).toBeCloseTo(0, 8);
  });
  it('fromRoots(1, 2, 3) has degree 3', () => {
    expect(Polynomial.fromRoots(1, 2, 3).degree).toBe(3);
  });
  it('fromRoots(1, 2, 3) evaluates to 0 at each root', () => {
    const p = Polynomial.fromRoots(1, 2, 3);
    expect(p.evaluate(1)).toBeCloseTo(0, 8);
    expect(p.evaluate(2)).toBeCloseTo(0, 8);
    expect(p.evaluate(3)).toBeCloseTo(0, 8);
  });
  it('fromRoots(-2, 5) = (x+2)(x-5)', () => {
    const p = Polynomial.fromRoots(-2, 5);
    expect(p.evaluate(-2)).toBeCloseTo(0, 8);
    expect(p.evaluate(5)).toBeCloseTo(0, 8);
    // (x - (-2))(x - 5) at x=0: (0+2)(0-5) = -10
    expect(p.evaluate(0)).toBeCloseTo(-10, 8);
  });
  it('fromRoots(r) leading coefficient is 1', () => {
    const p = Polynomial.fromRoots(3);
    expect(p.coeff(1)).toBeCloseTo(1, 8);
  });
  it('fromRoots with n roots has degree n', () => {
    for (let n = 1; n <= 5; n++) {
      const roots = Array.from({ length: n }, (_, i) => i);
      expect(Polynomial.fromRoots(...roots).degree).toBe(n);
    }
  });

  // Loop: polynomial from roots evaluates to 0 at each root
  for (let r = -5; r <= 5; r++) {
    it(`fromRoots(${r}) evaluates to 0 at x=${r}`, () => {
      const p = Polynomial.fromRoots(r);
      expect(p.evaluate(r)).toBeCloseTo(0, 8);
    });
  }

  // Loop: fromRoots(a, b) evaluates to 0 at a and b
  const rootPairs = [[-1, 1], [0, 2], [3, -3], [1, 4], [-2, 5]];
  for (const [a, b] of rootPairs) {
    it(`fromRoots(${a}, ${b}) has roots at ${a} and ${b}`, () => {
      const p = Polynomial.fromRoots(a, b);
      expect(p.evaluate(a)).toBeCloseTo(0, 8);
      expect(p.evaluate(b)).toBeCloseTo(0, 8);
    });
  }

  // Loop: fromRoots triple root
  for (let r = -2; r <= 2; r++) {
    it(`fromRoots(${r},${r},${r}) = (x-${r})^3`, () => {
      const p = Polynomial.fromRoots(r, r, r);
      const q = new Polynomial([-r, 1]).pow(3);
      expect(p.equals(q, 1e-9)).toBe(true);
    });
  }

  // Loop: fromRoots degree check
  for (let n = 1; n <= 8; n++) {
    it(`fromRoots of ${n} roots has degree ${n}`, () => {
      const roots = Array.from({ length: n }, (_, i) => i + 1);
      expect(Polynomial.fromRoots(...roots).degree).toBe(n);
    });
  }

  // Loop: product of fromRoots factor polynomials
  for (let a = 1; a <= 5; a++) {
    for (let b = a + 1; b <= 6; b++) {
      it(`fromRoots(${a},${b}) = (x-${a})(x-${b})`, () => {
        const p = Polynomial.fromRoots(a, b);
        const q = new Polynomial([-a, 1]).multiply(new Polynomial([-b, 1]));
        expect(p.equals(q, 1e-9)).toBe(true);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 32. polyAdd / polySub / polyMul standalone
// ---------------------------------------------------------------------------

describe('polyAdd standalone', () => {
  it('polyAdd([1,2],[3,4]) = [4,6]', () => {
    expect(polyAdd([1, 2], [3, 4])).toEqual([4, 6]);
  });
  it('polyAdd([], []) = []', () => {
    expect(polyAdd([], [])).toEqual([]);
  });
  it('polyAdd([1], []) = [1]', () => {
    expect(polyAdd([1], [])).toEqual([1]);
  });
  it('polyAdd([0], [0]) = []', () => {
    // trim trailing zeros: [0] is zero poly, [0]+[0] = []
    expect(polyAdd([0], [0])).toEqual([]);
  });
  it('polyAdd([1,2,3],[4,5]) = [5,7,3]', () => {
    expect(polyAdd([1, 2, 3], [4, 5])).toEqual([5, 7, 3]);
  });
  it('polyAdd([1,0,-1],[0,1,1]) = [1,1,0]', () => {
    // trim: [1,1,0] -> [1,1]
    expect(polyAdd([1, 0, -1], [0, 1, 1])).toEqual([1, 1]);
  });

  // Loop: polyAdd(a, b) evaluation matches a(x)+b(x)
  const addA = [1, 2, 3];
  const addB = [4, 5];
  for (let x = -4; x <= 4; x++) {
    it(`polyAdd(a,b) evaluated at x=${x} matches sum`, () => {
      const result = new Polynomial(polyAdd(addA, addB)).evaluate(x);
      const expected = new Polynomial(addA).evaluate(x) + new Polynomial(addB).evaluate(x);
      expect(result).toBeCloseTo(expected, 8);
    });
  }

  // Loop: polyAdd with zeros
  for (let n = 1; n <= 5; n++) {
    it(`polyAdd(zeros, [n]) for n=${n} returns [${n}]`, () => {
      expect(polyAdd([0, 0], [n])).toEqual([n]);
    });
  }

  // Loop: polyAdd commutativity
  for (let i = 0; i < 5; i++) {
    const a2 = [i, i + 1];
    const b2 = [i + 2, i + 3];
    it(`polyAdd commutes for pair ${i}`, () => {
      const r1 = polyAdd(a2, b2);
      const r2 = polyAdd(b2, a2);
      expect(r1).toEqual(r2);
    });
  }
});

describe('polySub standalone', () => {
  it('polySub([5,3],[2,1]) = [3,2]', () => {
    expect(polySub([5, 3], [2, 1])).toEqual([3, 2]);
  });
  it('polySub([1,2,3],[1,2,3]) = []', () => {
    expect(polySub([1, 2, 3], [1, 2, 3])).toEqual([]);
  });
  it('polySub([],[]) = []', () => {
    expect(polySub([], [])).toEqual([]);
  });
  it('polySub([5],[3]) = [2]', () => {
    expect(polySub([5], [3])).toEqual([2]);
  });

  // Loop: polySub evaluation
  const subA2 = [1, 3, 5];
  const subB2 = [2, 1];
  for (let x = -3; x <= 3; x++) {
    it(`polySub(a,b) evaluated at x=${x} matches difference`, () => {
      const result = new Polynomial(polySub(subA2, subB2)).evaluate(x);
      const expected = new Polynomial(subA2).evaluate(x) - new Polynomial(subB2).evaluate(x);
      expect(result).toBeCloseTo(expected, 8);
    });
  }

  // Loop: polySub anti-symmetry
  for (let i = 1; i <= 5; i++) {
    it(`polySub([${i}],[${i + 1}]) = [-1]`, () => {
      expect(polySub([i], [i + 1])).toEqual([-1]);
    });
  }

  // Loop: polySub self is zero
  for (let d = 0; d <= 4; d++) {
    it(`polySub(p, p) for degree ${d} is []`, () => {
      const c = Array.from({ length: d + 1 }, (_, i) => i + 1);
      expect(polySub(c, c)).toEqual([]);
    });
  }
});

describe('polyMul standalone', () => {
  it('polyMul([1,1],[1,1]) = [1,2,1]', () => {
    expect(polyMul([1, 1], [1, 1])).toEqual([1, 2, 1]);
  });
  it('polyMul([],[1,2]) = []', () => {
    expect(polyMul([], [1, 2])).toEqual([]);
  });
  it('polyMul([1],[1,2,3]) = [1,2,3]', () => {
    expect(polyMul([1], [1, 2, 3])).toEqual([1, 2, 3]);
  });
  it('polyMul([-1,1],[1,1]) = [-1,0,1]', () => {
    expect(polyMul([-1, 1], [1, 1])).toEqual([-1, 0, 1]);
  });
  it('polyMul([2],[3]) = [6]', () => {
    expect(polyMul([2], [3])).toEqual([6]);
  });

  // Loop: polyMul evaluation
  const mulA2 = [1, 2];
  const mulB2 = [3, 4, 5];
  for (let x = -3; x <= 3; x++) {
    it(`polyMul(a,b) evaluated at x=${x} matches product`, () => {
      const result = new Polynomial(polyMul(mulA2, mulB2)).evaluate(x);
      const expected = new Polynomial(mulA2).evaluate(x) * new Polynomial(mulB2).evaluate(x);
      expect(result).toBeCloseTo(expected, 8);
    });
  }

  // Loop: polyMul commutativity
  const comA = [1, 2, 3];
  const comB = [4, 5];
  for (let x = -2; x <= 2; x++) {
    it(`polyMul commutes at x=${x}`, () => {
      const r1 = new Polynomial(polyMul(comA, comB)).evaluate(x);
      const r2 = new Polynomial(polyMul(comB, comA)).evaluate(x);
      expect(r1).toBeCloseTo(r2, 8);
    });
  }

  // Loop: polyMul by monomial shifts degree
  for (let n = 0; n <= 5; n++) {
    it(`polyMul([1,1], x^${n} monomial) has degree ${n + 1}`, () => {
      const mono = new Array(n + 1).fill(0);
      mono[n] = 1;
      const result = polyMul([1, 1], mono);
      expect(new Polynomial(result).degree).toBe(n + 1);
    });
  }
});

// ---------------------------------------------------------------------------
// 33. polyEval standalone
// ---------------------------------------------------------------------------

describe('polyEval standalone', () => {
  it('polyEval([1,2,3], 0) = 1', () => {
    expect(polyEval([1, 2, 3], 0)).toBe(1);
  });
  it('polyEval([0,1], 5) = 5', () => {
    expect(polyEval([0, 1], 5)).toBe(5);
  });
  it('polyEval([], x) = 0', () => {
    expect(polyEval([], 99)).toBe(0);
  });
  it('polyEval([5], 100) = 5', () => {
    expect(polyEval([5], 100)).toBe(5);
  });
  it('polyEval([1,0,1], 3) = 1+9 = 10', () => {
    expect(polyEval([1, 0, 1], 3)).toBeCloseTo(10, 8);
  });

  // Loop: polyEval on x polynomial
  for (let x = -5; x <= 5; x++) {
    it(`polyEval([0,1], ${x}) = ${x}`, () => {
      expect(polyEval([0, 1], x)).toBe(x);
    });
  }

  // Loop: polyEval on x^2 polynomial
  for (let x = 0; x <= 9; x++) {
    it(`polyEval([0,0,1], ${x}) = ${x * x}`, () => {
      expect(polyEval([0, 0, 1], x)).toBeCloseTo(x * x, 8);
    });
  }

  // Loop: polyEval(p, x) matches Polynomial.evaluate(x)
  const evalCoeffs = [2, -3, 0, 5, -1];
  for (let x = -4; x <= 4; x++) {
    it(`polyEval(evalCoeffs, ${x}) matches Polynomial class`, () => {
      expect(polyEval(evalCoeffs, x)).toBeCloseTo(new Polynomial(evalCoeffs).evaluate(x), 8);
    });
  }
});

// ---------------------------------------------------------------------------
// 34. polyDerivative / polyIntegral standalone
// ---------------------------------------------------------------------------

describe('polyDerivative standalone', () => {
  it('polyDerivative([5]) = []', () => {
    expect(polyDerivative([5])).toEqual([]);
  });
  it('polyDerivative([]) = []', () => {
    expect(polyDerivative([])).toEqual([]);
  });
  it('polyDerivative([0,1]) = [1]', () => {
    expect(polyDerivative([0, 1])).toEqual([1]);
  });
  it('polyDerivative([0,0,1]) = [0,2]', () => {
    expect(polyDerivative([0, 0, 1])).toEqual([0, 2]);
  });
  it('polyDerivative([1,2,3]) = [2,6]', () => {
    expect(polyDerivative([1, 2, 3])).toEqual([2, 6]);
  });

  // Loop: polyDerivative(x^n) = n*x^(n-1)
  for (let n = 1; n <= 8; n++) {
    it(`polyDerivative of x^${n} has degree ${n - 1}`, () => {
      const c = new Array(n + 1).fill(0);
      c[n] = 1;
      const result = polyDerivative(c);
      expect(new Polynomial(result).degree).toBe(n - 1);
    });
  }

  // Loop: polyDerivative evaluation matches numerical derivative
  const derivCoeffs = [1, 3, 3, 1]; // (1+x)^3
  for (let x = -2; x <= 2; x++) {
    it(`polyDerivative evaluated at x=${x} matches numerical`, () => {
      const h = 1e-7;
      const numerical = (polyEval(derivCoeffs, x + h) - polyEval(derivCoeffs, x - h)) / (2 * h);
      expect(polyEval(polyDerivative(derivCoeffs), x)).toBeCloseTo(numerical, 4);
    });
  }

  // Loop: polyDerivative(constant) = []
  for (let c = 1; c <= 5; c++) {
    it(`polyDerivative([${c}]) is empty (zero derivative)`, () => {
      expect(polyDerivative([c])).toEqual([]);
    });
  }
});

describe('polyIntegral standalone', () => {
  it('polyIntegral([]) returns zero polynomial (empty coefficients)', () => {
    // integral of zero polynomial is zero (constant 0 trims away)
    expect(polyIntegral([])).toEqual([]);
  });
  it('polyIntegral([1]) = [0,1]', () => {
    expect(polyIntegral([1])).toEqual([0, 1]);
  });
  it('polyIntegral([0,2]) = [0,0,1]', () => {
    // integral of 2x is x^2
    expect(polyIntegral([0, 2])).toEqual([0, 0, 1]);
  });
  it('polyIntegral([1], 5) = [5,1]', () => {
    expect(polyIntegral([1], 5)).toEqual([5, 1]);
  });
  it('polyIntegral([0,1]) coeff[2] = 0.5', () => {
    const r = polyIntegral([0, 1]);
    expect(r[2]).toBeCloseTo(0.5, 8);
  });

  // Loop: polyIntegral constant(n) = n*x (skip n=0 since integral of 0 is empty)
  for (let n = -4; n <= 4; n++) {
    if (n === 0) {
      it(`polyIntegral([0]) yields zero polynomial (constant 0 trims)`, () => {
        // integral of zero poly is the zero poly
        expect(new Polynomial(polyIntegral([0])).isZero()).toBe(true);
      });
    } else {
      it(`polyIntegral([${n}])[1] = ${n}`, () => {
        expect(polyIntegral([n])[1]).toBe(n);
      });
    }
  }

  // Loop: derivative of integral = original
  const intCoeffs = [3, 1, 4, 1, 5];
  for (let x = -2; x <= 2; x++) {
    it(`polyDerivative(polyIntegral(p)) at x=${x} matches p`, () => {
      const integral = polyIntegral(intCoeffs);
      const backDeriv = polyDerivative(integral);
      expect(polyEval(backDeriv, x)).toBeCloseTo(polyEval(intCoeffs, x), 8);
    });
  }

  // Loop: polyIntegral degree = original degree + 1
  for (let d = 0; d <= 6; d++) {
    it(`polyIntegral of degree-${d} polynomial has degree ${d + 1}`, () => {
      const c = new Array(d + 1).fill(1);
      const result = polyIntegral(c);
      expect(new Polynomial(result).degree).toBe(d + 1);
    });
  }
});

// ---------------------------------------------------------------------------
// 35. gcd standalone function
// ---------------------------------------------------------------------------

describe('gcd standalone function', () => {
  it('gcd(p, zero) is monic', () => {
    const p = new Polynomial([2, 4]);
    const g = gcd(p, new Polynomial([]));
    expect(g.coeff(g.degree as number)).toBeCloseTo(1, 8);
  });
  it('gcd of coprime polynomials = constant 1', () => {
    const p = new Polynomial([-1, 1]);
    const q = new Polynomial([1, 1]);
    const g = gcd(p, q);
    expect(g.degree).toBe(0);
  });
  it('gcd(p, p) is monic version of p', () => {
    const p = new Polynomial([1, 2, 1]);
    const g = gcd(p, p);
    expect(g.coeff(g.degree as number)).toBeCloseTo(1, 8);
  });
  it('gcd divides both polynomials', () => {
    const xm1 = new Polynomial([-1, 1]);
    const xp1 = new Polynomial([1, 1]);
    const a = xm1.multiply(xm1);
    const b = xm1.multiply(xp1);
    const g = gcd(a, b);
    expect(g.degree).toBe(1);
    expect(g.evaluate(1)).toBeCloseTo(0, 8);
  });
  it('gcd matches Polynomial.gcd', () => {
    const p = new Polynomial([-2, 0, 1]);
    const q = new Polynomial([-1, 1]);
    expect(gcd(p, q).equals(Polynomial.gcd(p, q))).toBe(true);
  });

  // Loop: gcd(x^n, x^m) has degree min(n,m)
  for (let n = 1; n <= 4; n++) {
    for (let m = 1; m <= 4; m++) {
      it(`gcd(x^${n}, x^${m}) degree = ${Math.min(n, m)}`, () => {
        expect(gcd(monomial(1, n), monomial(1, m)).degree).toBe(Math.min(n, m));
      });
    }
  }

  // Loop: gcd is monic
  for (let k = 1; k <= 5; k++) {
    it(`gcd(${k}*x, x) leading coeff = 1`, () => {
      const p = monomial(k, 1);
      const q = monomial(1, 1);
      const g = gcd(p, q);
      expect(g.coeff(g.degree as number)).toBeCloseTo(1, 8);
    });
  }

  // Loop: gcd of polynomial with itself scaled
  const gcdBase = new Polynomial([1, 1]);
  for (let s = 1; s <= 6; s++) {
    it(`gcd(p, ${s}*p) is monic`, () => {
      const g = gcd(gcdBase, gcdBase.scale(s));
      expect(g.coeff(g.degree as number)).toBeCloseTo(1, 8);
    });
  }
});

// ---------------------------------------------------------------------------
// 36. lagrangeInterpolationTuples and newtonInterpolationCoeffs
// ---------------------------------------------------------------------------

describe('lagrangeInterpolationTuples', () => {
  it('empty array returns []', () => {
    expect(lagrangeInterpolationTuples([])).toEqual([]);
  });
  it('single point [2,5] returns [5]', () => {
    const r = lagrangeInterpolationTuples([[2, 5]]);
    expect(new Polynomial(r).evaluate(2)).toBeCloseTo(5, 8);
  });
  it('two points determine a linear polynomial', () => {
    const r = lagrangeInterpolationTuples([[0, 1], [1, 3]]);
    expect(new Polynomial(r).evaluate(0)).toBeCloseTo(1, 8);
    expect(new Polynomial(r).evaluate(1)).toBeCloseTo(3, 8);
  });
  it('three points for y=x^2', () => {
    const r = lagrangeInterpolationTuples([[0, 0], [1, 1], [2, 4]]);
    for (let x = 0; x <= 2; x++) {
      expect(new Polynomial(r).evaluate(x)).toBeCloseTo(x * x, 6);
    }
  });
  it('matches lagrangeInterpolation with {x,y} objects', () => {
    const tuples: Array<[number, number]> = [[0, 1], [1, 4], [2, 9]];
    const r1 = lagrangeInterpolationTuples(tuples);
    const r2 = lagrangeInterpolation(tuples.map(([x, y]) => ({ x, y }))).coefficients;
    expect(r1.length).toBe(r2.length);
    for (let i = 0; i < r1.length; i++) {
      expect(r1[i]).toBeCloseTo(r2[i], 8);
    }
  });

  // Loop: y=2x+1 through various pairs
  for (let a = 0; a <= 4; a++) {
    const b = a + 2;
    it(`tuples for y=2x+1 through (${a},${2*a+1}) and (${b},${2*b+1})`, () => {
      const r = lagrangeInterpolationTuples([[a, 2 * a + 1], [b, 2 * b + 1]]);
      expect(new Polynomial(r).evaluate(a)).toBeCloseTo(2 * a + 1, 6);
      expect(new Polynomial(r).evaluate(b)).toBeCloseTo(2 * b + 1, 6);
    });
  }

  // Loop: y=x^3 through four points
  for (let x = 0; x <= 3; x++) {
    it(`tuples interpolation of x^3 passes through x=${x}`, () => {
      const pts: Array<[number, number]> = [0, 1, 2, 3].map((xi) => [xi, xi ** 3]);
      const r = lagrangeInterpolationTuples(pts);
      expect(new Polynomial(r).evaluate(x)).toBeCloseTo(x ** 3, 5);
    });
  }

  // Loop: constant y=7 through n=1..5 points
  for (let n = 1; n <= 5; n++) {
    it(`tuples constant y=7 through ${n} points`, () => {
      const pts: Array<[number, number]> = Array.from({ length: n }, (_, i) => [i, 7]);
      const r = lagrangeInterpolationTuples(pts);
      expect(new Polynomial(r).evaluate(0.5)).toBeCloseTo(7, 6);
    });
  }
});

describe('newtonInterpolationCoeffs', () => {
  it('empty returns []', () => {
    expect(newtonInterpolationCoeffs([], [])).toEqual([]);
  });
  it('single point [5], [3] returns polynomial evaluating to 3 at x=5', () => {
    const r = newtonInterpolationCoeffs([5], [3]);
    expect(new Polynomial(r).evaluate(5)).toBeCloseTo(3, 8);
  });
  it('two points give linear polynomial', () => {
    const r = newtonInterpolationCoeffs([0, 1], [1, 3]);
    expect(new Polynomial(r).evaluate(0)).toBeCloseTo(1, 8);
    expect(new Polynomial(r).evaluate(1)).toBeCloseTo(3, 8);
  });
  it('matches newtonInterpolation result', () => {
    const xs = [0, 1, 2, 3];
    const ys = [1, 4, 9, 16];
    const r1 = newtonInterpolationCoeffs(xs, ys);
    const r2 = newtonInterpolation(xs, ys).coefficients;
    expect(r1).toEqual(r2);
  });
  it('throws on mismatched lengths', () => {
    expect(() => newtonInterpolationCoeffs([1, 2], [1])).toThrow();
  });

  // Loop: y=x^2 interpolation passes through each point
  const sqXs = [0, 1, 2, 3, 4];
  const sqYs = sqXs.map((x) => x * x);
  for (let i = 0; i < sqXs.length; i++) {
    it(`newtonInterpolationCoeffs for x^2 passes through x=${sqXs[i]}`, () => {
      const r = newtonInterpolationCoeffs(sqXs, sqYs);
      expect(new Polynomial(r).evaluate(sqXs[i])).toBeCloseTo(sqYs[i], 5);
    });
  }

  // Loop: constant y=4 through n points
  for (let n = 1; n <= 5; n++) {
    it(`newtonInterpolationCoeffs constant y=4 through ${n} points`, () => {
      const xs = Array.from({ length: n }, (_, i) => i);
      const ys = xs.map(() => 4);
      const r = newtonInterpolationCoeffs(xs, ys);
      expect(new Polynomial(r).evaluate(0.5)).toBeCloseTo(4, 6);
    });
  }

  // Loop: linear function y=3x-2
  for (let n = 2; n <= 5; n++) {
    it(`newtonInterpolationCoeffs for y=3x-2 through ${n} points`, () => {
      const xs = Array.from({ length: n }, (_, i) => i);
      const ys = xs.map((x) => 3 * x - 2);
      const r = newtonInterpolationCoeffs(xs, ys);
      expect(new Polynomial(r).evaluate(0)).toBeCloseTo(-2, 6);
      expect(new Polynomial(r).evaluate(1)).toBeCloseTo(1, 6);
    });
  }
});
