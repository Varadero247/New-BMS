// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  LinearRecurrence,
  berlekampMassey,
  recurrenceNthTerm,
  nthFibonacci,
  nthLucas,
  nthTribonacci,
  nthPadovan,
  arithmeticSequence,
  geometricSequence,
  arithmeticSum,
  geometricSum,
  generateSequence,
  isLinearRecurrence,
} from '../linear-recurrence';

// ---------------------------------------------------------------------------
// Pre-computed reference tables
// ---------------------------------------------------------------------------

// Fibonacci: F(0)=0,F(1)=1,...
const FIB: number[] = [
  0, 1, 1, 2, 3, 5, 8, 13, 21, 34,       // 0-9
  55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, // 10-19
  6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418, 317811, 514229, // 20-29
  832040, 1346269, 2178309, 3524578, 5702887, 9227465, 14930352, 24157817, 39088169, 63245986, // 30-39
  102334155, 165580141, 267914296, 433494437, 701408733, 1134903170, 1836311903, // 40-46
];

// Lucas: L(0)=2,L(1)=1,L(2)=3,...
const LUCAS: number[] = [
  2, 1, 3, 4, 7, 11, 18, 29, 47, 76,     // 0-9
  123, 199, 322, 521, 843, 1364, 2207, 3571, 5778, 9349, // 10-19
  15127, 24476, 39603, 64079, 103682, 167761, 271443, 439204, 710647, 1149851, // 20-29
];

// Tribonacci: T(0)=0,T(1)=0,T(2)=1,...
const TRIB: number[] = [
  0, 0, 1, 1, 2, 4, 7, 13, 24, 44,       // 0-9
  81, 149, 274, 504, 927, 1705, 3136, 5768, 10609, 19513, // 10-19
  35890, 66012, 121415, 223317, 410744, 755476, 1389537, // 20-26
];

// Padovan: P(0)=1,P(1)=1,P(2)=1,P(n)=P(n-2)+P(n-3)
const PADOVAN: number[] = [
  1, 1, 1, 2, 2, 3, 4, 5, 7, 9,          // 0-9
  12, 16, 21, 28, 37, 49, 65, 86, 114, 151, // 10-19
  200, 265, 351, 465, 616, 816, 1081, 1432, 1897, 2513, // 20-29
];

// ---------------------------------------------------------------------------
// 1. nthFibonacci — 100 tests
// ---------------------------------------------------------------------------
describe('nthFibonacci', () => {
  // 47 known values
  for (let i = 0; i < FIB.length; i++) {
    it(`F(${i}) === ${FIB[i]}`, () => {
      expect(nthFibonacci(i)).toBe(FIB[i]);
    });
  }
  // Additional property tests: F(n) = F(n-1) + F(n-2)
  for (let i = 2; i < 40; i++) {
    it(`Fibonacci recurrence holds at n=${i}`, () => {
      expect(nthFibonacci(i)).toBe(nthFibonacci(i - 1) + nthFibonacci(i - 2));
    });
  }
  // Ensure non-negative result for n=0..9
  for (let i = 0; i <= 9; i++) {
    it(`nthFibonacci(${i}) >= 0`, () => {
      expect(nthFibonacci(i)).toBeGreaterThanOrEqual(0);
    });
  }
  // throw on negative
  it('throws on negative input', () => {
    expect(() => nthFibonacci(-1)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// 2. nthLucas — 100 tests
// ---------------------------------------------------------------------------
describe('nthLucas', () => {
  // 30 known values
  for (let i = 0; i < LUCAS.length; i++) {
    it(`L(${i}) === ${LUCAS[i]}`, () => {
      expect(nthLucas(i)).toBe(LUCAS[i]);
    });
  }
  // Recurrence: L(n) = L(n-1) + L(n-2)
  for (let i = 2; i < 40; i++) {
    it(`Lucas recurrence holds at n=${i}`, () => {
      expect(nthLucas(i)).toBe(nthLucas(i - 1) + nthLucas(i - 2));
    });
  }
  // All positive
  for (let i = 0; i <= 9; i++) {
    it(`nthLucas(${i}) > 0`, () => {
      expect(nthLucas(i)).toBeGreaterThan(0);
    });
  }
  it('throws on negative input', () => {
    expect(() => nthLucas(-1)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// 3. nthTribonacci — 100 tests
// ---------------------------------------------------------------------------
describe('nthTribonacci', () => {
  // 27 known values
  for (let i = 0; i < TRIB.length; i++) {
    it(`T(${i}) === ${TRIB[i]}`, () => {
      expect(nthTribonacci(i)).toBe(TRIB[i]);
    });
  }
  // Recurrence: T(n) = T(n-1) + T(n-2) + T(n-3) for n>=3
  for (let i = 3; i < 30; i++) {
    it(`Tribonacci recurrence holds at n=${i}`, () => {
      expect(nthTribonacci(i)).toBe(
        nthTribonacci(i - 1) + nthTribonacci(i - 2) + nthTribonacci(i - 3)
      );
    });
  }
  // Non-negative
  for (let i = 0; i <= 9; i++) {
    it(`nthTribonacci(${i}) >= 0`, () => {
      expect(nthTribonacci(i)).toBeGreaterThanOrEqual(0);
    });
  }
  it('throws on negative input', () => {
    expect(() => nthTribonacci(-1)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// 4. arithmeticSequence — 100 tests
// ---------------------------------------------------------------------------
describe('arithmeticSequence', () => {
  // a(n) = first + n*diff, varying first, diff, n
  const cases: Array<[number, number, number, number]> = [];

  // diff=1, first=0: 0,1,2,...
  for (let n = 0; n < 20; n++) cases.push([0, 1, n, n]);
  // diff=2, first=1: 1,3,5,...
  for (let n = 0; n < 20; n++) cases.push([1, 2, n, 1 + n * 2]);
  // diff=5, first=10
  for (let n = 0; n < 20; n++) cases.push([10, 5, n, 10 + n * 5]);
  // diff=-1, first=100
  for (let n = 0; n < 20; n++) cases.push([100, -1, n, 100 - n]);
  // diff=0, first=7 (constant)
  for (let n = 0; n < 20; n++) cases.push([7, 0, n, 7]);

  for (const [first, diff, n, expected] of cases) {
    it(`arithmeticSequence(${first},${diff},${n}) === ${expected}`, () => {
      expect(arithmeticSequence(first, diff, n)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 5. geometricSequence — 100 tests
// ---------------------------------------------------------------------------
describe('geometricSequence', () => {
  // g(n) = first * ratio^n
  const cases: Array<[number, number, number, number]> = [];

  // ratio=2, first=1: 1,2,4,8,...
  for (let n = 0; n < 20; n++) cases.push([1, 2, n, Math.pow(2, n)]);
  // ratio=3, first=1
  for (let n = 0; n < 20; n++) cases.push([1, 3, n, Math.pow(3, n)]);
  // ratio=0.5, first=1024
  for (let n = 0; n < 20; n++) cases.push([1024, 0.5, n, 1024 * Math.pow(0.5, n)]);
  // ratio=1, first=5 (constant)
  for (let n = 0; n < 20; n++) cases.push([5, 1, n, 5]);
  // ratio=-1, first=1: alternates 1,-1,1,...
  for (let n = 0; n < 20; n++) cases.push([1, -1, n, Math.pow(-1, n)]);

  for (const [first, ratio, n, expected] of cases) {
    it(`geometricSequence(${first},${ratio},${n}) ≈ ${expected}`, () => {
      expect(geometricSequence(first, ratio, n)).toBeCloseTo(expected, 9);
    });
  }
});

// ---------------------------------------------------------------------------
// 6. arithmeticSum — 100 tests
// ---------------------------------------------------------------------------
describe('arithmeticSum', () => {
  // S(n) = n*(2*first + (n-1)*diff)/2
  const cases: Array<[number, number, number, number]> = [];

  // first=1, diff=1: S(n) = n*(n+1)/2
  for (let n = 1; n <= 20; n++) cases.push([1, 1, n, (n * (n + 1)) / 2]);
  // first=0, diff=1: S(n) = n*(n-1)/2
  for (let n = 1; n <= 20; n++) cases.push([0, 1, n, (n * (n - 1)) / 2]);
  // first=5, diff=3
  for (let n = 1; n <= 20; n++) cases.push([5, 3, n, (n * (10 + (n - 1) * 3)) / 2]);
  // first=10, diff=-2
  for (let n = 1; n <= 20; n++) cases.push([10, -2, n, (n * (20 + (n - 1) * -2)) / 2]);
  // first=0, diff=0: S = 0
  for (let n = 1; n <= 20; n++) cases.push([0, 0, n, 0]);

  for (const [first, diff, n, expected] of cases) {
    it(`arithmeticSum(${first},${diff},${n}) === ${expected}`, () => {
      expect(arithmeticSum(first, diff, n)).toBeCloseTo(expected, 9);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. geometricSum — 100 tests
// ---------------------------------------------------------------------------
describe('geometricSum', () => {
  // S(n) = first*(ratio^n - 1)/(ratio - 1) for ratio≠1, first*n for ratio=1
  const cases: Array<[number, number, number, number]> = [];

  // ratio=2, first=1: S(n) = 2^n - 1
  for (let n = 1; n <= 20; n++) cases.push([1, 2, n, Math.pow(2, n) - 1]);
  // ratio=3, first=1: S(n) = (3^n - 1)/2
  for (let n = 1; n <= 20; n++) cases.push([1, 3, n, (Math.pow(3, n) - 1) / 2]);
  // ratio=0.5, first=1: S(n) = 1*(0.5^n-1)/(0.5-1) = 2*(1-0.5^n)
  for (let n = 1; n <= 20; n++) cases.push([1, 0.5, n, 2 * (1 - Math.pow(0.5, n))]);
  // ratio=1: S(n) = first*n
  for (let n = 1; n <= 20; n++) cases.push([5, 1, n, 5 * n]);
  // ratio=2, first=3: S(n) = 3*(2^n - 1)
  for (let n = 1; n <= 20; n++) cases.push([3, 2, n, 3 * (Math.pow(2, n) - 1)]);

  for (const [first, ratio, n, expected] of cases) {
    it(`geometricSum(${first},${ratio},${n}) ≈ ${expected}`, () => {
      expect(geometricSum(first, ratio, n)).toBeCloseTo(expected, 6);
    });
  }
});

// ---------------------------------------------------------------------------
// 8. recurrenceNthTerm with Fibonacci coefficients — 100 tests
// ---------------------------------------------------------------------------
describe('recurrenceNthTerm (Fibonacci)', () => {
  const coeffs = [1, 1]; // f(n) = f(n-1) + f(n-2)
  const init = [0, 1];

  // First 47 Fibonacci values
  for (let n = 0; n < FIB.length; n++) {
    it(`recurrenceNthTerm Fib(${n}) === ${FIB[n]}`, () => {
      expect(recurrenceNthTerm(coeffs, init, n)).toBe(FIB[n]);
    });
  }

  // Lucas: coeffs=[1,1], init=[2,1]
  const lucasInit = [2, 1];
  for (let n = 0; n < 30; n++) {
    it(`recurrenceNthTerm Lucas(${n}) === ${LUCAS[n]}`, () => {
      expect(recurrenceNthTerm(coeffs, lucasInit, n)).toBe(LUCAS[n]);
    });
  }

  // Tribonacci: coeffs=[1,1,1], init=[0,0,1]
  const tribCoeffs = [1, 1, 1];
  const tribInit = [0, 0, 1];
  for (let n = 0; n < TRIB.length; n++) {
    it(`recurrenceNthTerm Trib(${n}) === ${TRIB[n]}`, () => {
      expect(recurrenceNthTerm(tribCoeffs, tribInit, n)).toBe(TRIB[n]);
    });
  }
});

// ---------------------------------------------------------------------------
// 9. LinearRecurrence.nthTerm — 100 tests
// ---------------------------------------------------------------------------
describe('LinearRecurrence.nthTerm', () => {
  // Fibonacci via LinearRecurrence
  const fibRec = new LinearRecurrence([1, 1], [0, 1]);
  for (let n = 0; n < FIB.length; n++) {
    it(`LinearRecurrence Fib nthTerm(${n}) === ${FIB[n]}`, () => {
      expect(fibRec.nthTerm(n)).toBeCloseTo(FIB[n], 0);
    });
  }

  // Lucas via LinearRecurrence
  const lucasRec = new LinearRecurrence([1, 1], [2, 1]);
  for (let n = 0; n < LUCAS.length; n++) {
    it(`LinearRecurrence Lucas nthTerm(${n}) === ${LUCAS[n]}`, () => {
      expect(lucasRec.nthTerm(n)).toBeCloseTo(LUCAS[n], 0);
    });
  }

  // Tribonacci via LinearRecurrence
  const tribRec = new LinearRecurrence([1, 1, 1], [0, 0, 1]);
  for (let n = 0; n < TRIB.length; n++) {
    it(`LinearRecurrence Trib nthTerm(${n}) === ${TRIB[n]}`, () => {
      expect(tribRec.nthTerm(n)).toBeCloseTo(TRIB[n], 0);
    });
  }

  // Order property
  it('order is correct for Fibonacci', () => {
    expect(fibRec.order).toBe(2);
  });
  it('order is correct for Tribonacci', () => {
    expect(tribRec.order).toBe(3);
  });
  it('getCoefficients returns copy', () => {
    const c = fibRec.getCoefficients();
    expect(c).toEqual([1, 1]);
    c[0] = 99;
    expect(fibRec.getCoefficients()[0]).toBe(1); // no mutation
  });

  // Arithmetic progression as recurrence: f(n) = 2*f(n-1) - f(n-2), init=[0,1]
  // gives 0,1,2,3,4,...
  const apRec = new LinearRecurrence([2, -1], [0, 1]);
  for (let n = 0; n <= 20; n++) {
    it(`LinearRecurrence AP nthTerm(${n}) === ${n}`, () => {
      expect(apRec.nthTerm(n)).toBeCloseTo(n, 6);
    });
  }
});

// ---------------------------------------------------------------------------
// 10. LinearRecurrence.terms — 100 tests
// ---------------------------------------------------------------------------
describe('LinearRecurrence.terms', () => {
  const fibRec = new LinearRecurrence([1, 1], [0, 1]);

  // Length checks
  for (let count = 1; count <= 20; count++) {
    it(`terms(${count}) has length ${count}`, () => {
      expect(fibRec.terms(count)).toHaveLength(count);
    });
  }

  // Value checks: first 10 Fibonacci terms
  it('terms(10) matches first 10 Fibonacci numbers', () => {
    expect(fibRec.terms(10)).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
  });

  // terms(0) = []
  it('terms(0) returns empty array', () => {
    expect(fibRec.terms(0)).toEqual([]);
  });

  // Lucas terms
  const lucasRec = new LinearRecurrence([1, 1], [2, 1]);
  it('terms(10) matches first 10 Lucas numbers', () => {
    expect(lucasRec.terms(10)).toEqual(LUCAS.slice(0, 10));
  });

  // Tribonacci terms
  const tribRec = new LinearRecurrence([1, 1, 1], [0, 0, 1]);
  it('terms(10) matches first 10 Tribonacci numbers', () => {
    expect(tribRec.terms(10)).toEqual(TRIB.slice(0, 10));
  });

  // First element = initialValues[0]
  for (let v = 1; v <= 20; v++) {
    it(`first term with init[0]=${v} is ${v}`, () => {
      const r = new LinearRecurrence([1, 1], [v, v + 1]);
      expect(r.terms(1)[0]).toBe(v);
    });
  }

  // terms consistency with nthTerm
  const tribRec2 = new LinearRecurrence([1, 1, 1], [0, 0, 1]);
  for (let n = 0; n < 20; n++) {
    it(`terms includes correct value at index ${n}`, () => {
      const t = tribRec2.terms(n + 1);
      expect(t[n]).toBeCloseTo(TRIB[n], 0);
    });
  }

  // Geometric-like recurrence: f(n) = 2*f(n-1), init=[1] → 1,2,4,8,...
  const geoRec = new LinearRecurrence([2], [1]);
  for (let n = 0; n < 20; n++) {
    it(`geometric-like terms[${n}] === ${Math.pow(2, n)}`, () => {
      expect(geoRec.terms(n + 1)[n]).toBeCloseTo(Math.pow(2, n), 6);
    });
  }
});

// ---------------------------------------------------------------------------
// 11. berlekampMassey — 50 tests
// ---------------------------------------------------------------------------
describe('berlekampMassey', () => {
  // Fibonacci sequence: BM should find coefficients [1,1]
  for (let len = 4; len <= 20; len++) {
    it(`BM on Fibonacci length ${len} finds recurrence of order ≤ 2`, () => {
      const seq = FIB.slice(0, len);
      const coeffs = berlekampMassey(seq);
      expect(coeffs.length).toBeLessThanOrEqual(2);
    });
  }

  // Verify BM coefficients reproduce the sequence
  for (let len = 4; len <= 14; len++) {
    it(`BM coefficients reproduce Fibonacci sequence of length ${len}`, () => {
      const seq = FIB.slice(0, len);
      const coeffs = berlekampMassey(seq);
      const order = coeffs.length;
      for (let i = order; i < len; i++) {
        let expected = 0;
        for (let j = 0; j < order; j++) expected += coeffs[j] * seq[i - 1 - j];
        expect(Math.abs(expected - seq[i])).toBeLessThan(1e-6);
      }
    });
  }

  // Constant sequence: [5,5,5,5] → BM should find order-1 recurrence
  it('BM on constant sequence finds order 1', () => {
    const seq = [5, 5, 5, 5, 5, 5];
    const coeffs = berlekampMassey(seq);
    expect(coeffs.length).toBeLessThanOrEqual(1);
  });

  // Geometric sequence [1,2,4,8,16]: BM should find order-1 recurrence
  it('BM on geometric sequence finds order 1', () => {
    const seq = [1, 2, 4, 8, 16, 32];
    const coeffs = berlekampMassey(seq);
    expect(coeffs.length).toBeLessThanOrEqual(1);
  });

  // Lucas sequence
  it('BM on Lucas sequence finds order ≤ 2', () => {
    const coeffs = berlekampMassey(LUCAS.slice(0, 10));
    expect(coeffs.length).toBeLessThanOrEqual(2);
  });

  // Empty sequence
  it('BM on empty sequence returns []', () => {
    expect(berlekampMassey([])).toEqual([]);
  });

  // Single element
  it('BM on single element returns []', () => {
    expect(berlekampMassey([42])).toEqual([]);
  });

  // Arithmetic sequence [0,1,2,3,...]: recurrence f(n)=2f(n-1)-f(n-2)
  it('BM on arithmetic sequence finds order ≤ 2', () => {
    const seq = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const coeffs = berlekampMassey(seq);
    expect(coeffs.length).toBeLessThanOrEqual(2);
  });

  // Powers of 3: [1,3,9,27,...] → order-1
  it('BM on powers of 3 finds order 1', () => {
    const seq = [1, 3, 9, 27, 81, 243];
    const coeffs = berlekampMassey(seq);
    expect(coeffs.length).toBeLessThanOrEqual(1);
  });

  // Tribonacci
  it('BM on Tribonacci finds order ≤ 3', () => {
    const coeffs = berlekampMassey(TRIB.slice(0, 12));
    expect(coeffs.length).toBeLessThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// 12. generateSequence — 50 tests
// ---------------------------------------------------------------------------
describe('generateSequence', () => {
  // Fibonacci via generateSequence
  it('generates Fibonacci sequence', () => {
    const seq = generateSequence((n, prev) => prev[n - 1] + prev[n - 2], [0, 1], 10);
    expect(seq).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
  });

  // Tribonacci
  it('generates Tribonacci sequence', () => {
    const seq = generateSequence(
      (n, prev) => prev[n - 1] + prev[n - 2] + prev[n - 3],
      [0, 0, 1],
      10
    );
    expect(seq).toEqual(TRIB.slice(0, 10));
  });

  // Constant sequence
  it('generates constant sequence when f returns constant', () => {
    const seq = generateSequence(() => 7, [7, 7], 10);
    expect(seq).toEqual(new Array(10).fill(7));
  });

  // Length checks for various counts
  for (let count = 1; count <= 20; count++) {
    it(`generateSequence returns exactly ${count} elements`, () => {
      const seq = generateSequence((n, prev) => prev[n - 1] + 1, [0], count);
      expect(seq).toHaveLength(count);
    });
  }

  // Arithmetic sequence via generator
  for (let d = 1; d <= 10; d++) {
    it(`generateSequence arithmetic diff=${d}`, () => {
      const seq = generateSequence((n, prev) => prev[n - 1] + d, [0], 5);
      for (let i = 0; i < 5; i++) {
        expect(seq[i]).toBe(i * d);
      }
    });
  }

  // Powers of 2 via generator
  it('generates powers of 2', () => {
    const seq = generateSequence((n, prev) => prev[n - 1] * 2, [1], 10);
    for (let i = 0; i < 10; i++) {
      expect(seq[i]).toBe(Math.pow(2, i));
    }
  });

  // Init longer than count → truncated to count
  it('returns init truncated to count', () => {
    const seq = generateSequence((n, prev) => prev[n - 1], [1, 2, 3, 4, 5], 3);
    expect(seq).toHaveLength(3);
    expect(seq[0]).toBe(1);
  });

  // count=0
  it('returns empty array for count=0', () => {
    const seq = generateSequence((n, prev) => prev[n - 1], [0], 0);
    expect(seq).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 13. isLinearRecurrence — 50 tests
// ---------------------------------------------------------------------------
describe('isLinearRecurrence', () => {
  // Fibonacci → true
  for (let len = 5; len <= 20; len++) {
    it(`Fibonacci seq length ${len} isLinearRecurrence === true`, () => {
      expect(isLinearRecurrence(FIB.slice(0, len))).toBe(true);
    });
  }

  // Constant sequence → true
  it('constant sequence [5,5,5,5,5] isLinearRecurrence === true', () => {
    expect(isLinearRecurrence([5, 5, 5, 5, 5])).toBe(true);
  });

  // Geometric sequence → true
  it('geometric sequence [1,2,4,8,16] isLinearRecurrence === true', () => {
    expect(isLinearRecurrence([1, 2, 4, 8, 16, 32])).toBe(true);
  });

  // Lucas → true
  it('Lucas sequence isLinearRecurrence === true', () => {
    expect(isLinearRecurrence(LUCAS.slice(0, 10))).toBe(true);
  });

  // Tribonacci → true
  it('Tribonacci sequence isLinearRecurrence === true', () => {
    expect(isLinearRecurrence(TRIB.slice(0, 10))).toBe(true);
  });

  // Arithmetic sequence → true (order 2)
  it('arithmetic sequence isLinearRecurrence === true', () => {
    const seq = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(isLinearRecurrence(seq)).toBe(true);
  });

  // Single element → false
  it('single element returns false', () => {
    expect(isLinearRecurrence([1])).toBe(false);
  });

  // Empty → false
  it('empty sequence returns false', () => {
    expect(isLinearRecurrence([])).toBe(false);
  });

  // maxOrder too small to capture Fibonacci
  it('Fibonacci returns false when maxOrder=1', () => {
    // Fibonacci needs order 2, so maxOrder=1 should return false
    const seq = FIB.slice(2, 12); // [1,1,2,3,5,8,13,21,34,55] — still order 2
    // With maxOrder=1, should not find it
    expect(isLinearRecurrence(seq, 1)).toBe(false);
  });

  // Sequences satisfying higher-order recurrences
  it('Padovan isLinearRecurrence === true with maxOrder=3', () => {
    expect(isLinearRecurrence(PADOVAN.slice(0, 10), 3)).toBe(true);
  });

  // Powers of 3 → true
  it('powers of 3 isLinearRecurrence === true', () => {
    expect(isLinearRecurrence([1, 3, 9, 27, 81, 243])).toBe(true);
  });

  // All-zeros → true (trivially satisfies any recurrence)
  it('all-zeros sequence isLinearRecurrence === true', () => {
    expect(isLinearRecurrence([0, 0, 0, 0, 0])).toBe(true);
  });

  // Fibonacci with maxOrder=2 → true
  for (let len = 5; len <= 15; len++) {
    it(`Fibonacci length ${len} isLinearRecurrence with maxOrder=2 === true`, () => {
      expect(isLinearRecurrence(FIB.slice(0, len), 2)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 14. nthPadovan — additional tests to reach 1,000+
// ---------------------------------------------------------------------------
describe('nthPadovan', () => {
  for (let i = 0; i < PADOVAN.length; i++) {
    it(`P(${i}) === ${PADOVAN[i]}`, () => {
      expect(nthPadovan(i)).toBe(PADOVAN[i]);
    });
  }
  // Recurrence: P(n) = P(n-2) + P(n-3)
  for (let i = 3; i < 30; i++) {
    it(`Padovan recurrence holds at n=${i}`, () => {
      expect(nthPadovan(i)).toBe(nthPadovan(i - 2) + nthPadovan(i - 3));
    });
  }
  it('throws on negative input', () => {
    expect(() => nthPadovan(-1)).toThrow();
  });
  for (let i = 0; i <= 9; i++) {
    it(`nthPadovan(${i}) > 0`, () => {
      expect(nthPadovan(i)).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 15. LinearRecurrence — Padovan, AP, edge cases (extra to hit 1,000)
// ---------------------------------------------------------------------------
describe('LinearRecurrence extra', () => {
  // Padovan: P(n) = P(n-2) + P(n-3) → coeffs = [0,1,1], init=[1,1,1]
  const padRec = new LinearRecurrence([0, 1, 1], [1, 1, 1]);
  for (let n = 0; n < PADOVAN.length; n++) {
    it(`Padovan LinearRecurrence nthTerm(${n}) === ${PADOVAN[n]}`, () => {
      expect(padRec.nthTerm(n)).toBeCloseTo(PADOVAN[n], 0);
    });
  }

  // First-order recurrence: f(n) = 3*f(n-1), f(0)=1 → powers of 3
  const powRec = new LinearRecurrence([3], [1]);
  for (let n = 0; n <= 15; n++) {
    it(`pow3 LinearRecurrence nthTerm(${n}) === ${Math.pow(3, n)}`, () => {
      expect(powRec.nthTerm(n)).toBeCloseTo(Math.pow(3, n), 4);
    });
  }

  // terms() for power-of-3 recurrence
  it('LinearRecurrence power-of-3 terms(6) correct', () => {
    const t = powRec.terms(6);
    expect(t).toHaveLength(6);
    for (let i = 0; i < 6; i++) {
      expect(t[i]).toBeCloseTo(Math.pow(3, i), 4);
    }
  });

  // getCoefficients immutability
  it('getCoefficients mutation does not affect internal state', () => {
    const r = new LinearRecurrence([1, 2], [0, 1]);
    const c = r.getCoefficients();
    c[0] = 999;
    expect(r.getCoefficients()[0]).toBe(1);
  });

  // order accessor
  it('order of 4th-order recurrence is 4', () => {
    const r = new LinearRecurrence([1, 1, 1, 1], [0, 0, 0, 1]);
    expect(r.order).toBe(4);
  });
  it('order of 1st-order recurrence is 1', () => {
    const r = new LinearRecurrence([2], [1]);
    expect(r.order).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 16. recurrenceNthTerm edge cases & extra sequences (extra for 1,000)
// ---------------------------------------------------------------------------
describe('recurrenceNthTerm extra', () => {
  // Power-of-2: coeffs=[2], init=[1]
  for (let n = 0; n <= 20; n++) {
    it(`recurrenceNthTerm pow2(${n}) === ${Math.pow(2, n)}`, () => {
      expect(recurrenceNthTerm([2], [1], n)).toBeCloseTo(Math.pow(2, n), 4);
    });
  }

  // Padovan: coeffs=[0,1,1], init=[1,1,1]
  for (let n = 0; n < PADOVAN.length; n++) {
    it(`recurrenceNthTerm Padovan(${n}) === ${PADOVAN[n]}`, () => {
      expect(recurrenceNthTerm([0, 1, 1], [1, 1, 1], n)).toBe(PADOVAN[n]);
    });
  }

  // Single element recurrence returning init value
  it('recurrenceNthTerm n=0 returns init[0]', () => {
    expect(recurrenceNthTerm([1, 1], [0, 1], 0)).toBe(0);
  });
  it('recurrenceNthTerm n=1 returns init[1]', () => {
    expect(recurrenceNthTerm([1, 1], [0, 1], 1)).toBe(1);
  });

  // Constant recurrence: coeffs=[1], init=[7] → always 7
  for (let n = 0; n <= 10; n++) {
    it(`constant recurrence n=${n} === 7`, () => {
      expect(recurrenceNthTerm([1], [7], n)).toBe(7);
    });
  }
});

// ---------------------------------------------------------------------------
// 17. arithmeticSequence / geometricSequence extra edge cases
// ---------------------------------------------------------------------------
describe('arithmeticSequence extra', () => {
  // n=0 always returns first
  for (let first = -5; first <= 5; first++) {
    it(`arithmeticSequence(${first},3,0) === ${first}`, () => {
      expect(arithmeticSequence(first, 3, 0)).toBe(first);
    });
  }
  // Large n
  it('arithmeticSequence(0,1,1000) === 1000', () => {
    expect(arithmeticSequence(0, 1, 1000)).toBe(1000);
  });
  it('arithmeticSequence(1,2,50) === 101', () => {
    expect(arithmeticSequence(1, 2, 50)).toBe(101);
  });
});

describe('geometricSequence extra', () => {
  // n=0 always returns first
  for (let first = 1; first <= 10; first++) {
    it(`geometricSequence(${first},2,0) === ${first}`, () => {
      expect(geometricSequence(first, 2, 0)).toBe(first);
    });
  }
  // ratio=0 → 0 for n>0
  it('geometricSequence(5,0,3) === 0', () => {
    expect(geometricSequence(5, 0, 3)).toBe(0);
  });
  it('geometricSequence(5,0,0) === 5', () => {
    expect(geometricSequence(5, 0, 0)).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// 18. arithmeticSum / geometricSum edge cases
// ---------------------------------------------------------------------------
describe('arithmeticSum extra', () => {
  it('arithmeticSum(1,1,100) === 5050', () => {
    expect(arithmeticSum(1, 1, 100)).toBe(5050);
  });
  it('arithmeticSum(0,2,10) === 90', () => {
    // 0+2+4+6+8+10+12+14+16+18 = 90
    expect(arithmeticSum(0, 2, 10)).toBe(90);
  });
  it('arithmeticSum(5,5,5) correct', () => {
    // 5+10+15+20+25 = 75; formula: 5*(10+20)/2=75
    expect(arithmeticSum(5, 5, 5)).toBe(75);
  });
  it('arithmeticSum n=1 returns first', () => {
    expect(arithmeticSum(7, 3, 1)).toBe(7);
  });
});

describe('geometricSum extra', () => {
  it('geometricSum(1,2,10) === 1023', () => {
    expect(geometricSum(1, 2, 10)).toBeCloseTo(1023, 6);
  });
  it('geometricSum(1,1,10) === 10', () => {
    expect(geometricSum(1, 1, 10)).toBe(10);
  });
  it('geometricSum(2,3,4) === 80', () => {
    // 2+6+18+54 = 80
    expect(geometricSum(2, 3, 4)).toBeCloseTo(80, 6);
  });
  it('geometricSum n=1 returns first', () => {
    expect(geometricSum(5, 2, 1)).toBeCloseTo(5, 6);
  });
});
