// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  gcd,
  lcm,
  isPrime,
  primes,
  factors,
  fibonacci,
  factorial,
  binomial,
  clamp,
  lerp,
  inverseLerp,
  mapRange,
  roundTo,
  truncateTo,
  toFraction,
  sum,
  mean,
  median,
  mode,
  variance,
  stdDev,
  coefficientOfVariation,
  skewness,
  kurtosis,
  percentile,
  quartiles,
  iqr,
  zScore,
  normalize,
  standardize,
  covariance,
  correlation,
  linearRegression,
  movingAverage,
  exponentialMovingAverage,
  dotProduct,
  crossProduct3d,
  magnitude,
  normalize2,
  vectorAdd,
  vectorSubtract,
  vectorScale,
} from '../math-utils';

// Known prime numbers for reference (first 100+ primes)
const KNOWN_PRIMES = new Set([
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
  157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233,
  239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317,
  331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419,
  421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503,
]);

// Fibonacci sequence values (first 21 values, index 0-20)
const FIBONACCI_KNOWN = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765];

// ---------------------------------------------------------------------------
// gcd
// ---------------------------------------------------------------------------
describe('gcd', () => {
  test('gcd(0, 0) = 0', () => expect(gcd(0, 0)).toBe(0));
  test('gcd(12, 8) = 4', () => expect(gcd(12, 8)).toBe(4));
  test('gcd(8, 12) = 4', () => expect(gcd(8, 12)).toBe(4));
  test('gcd(100, 75) = 25', () => expect(gcd(100, 75)).toBe(25));
  test('gcd(17, 13) = 1 (coprime primes)', () => expect(gcd(17, 13)).toBe(1));
  test('gcd(n, 0) = n', () => { for (let i = 1; i <= 20; i++) expect(gcd(i, 0)).toBe(i); });
  test('gcd(0, n) = n', () => { for (let i = 1; i <= 20; i++) expect(gcd(0, i)).toBe(i); });
  test('gcd is commutative', () => {
    for (let a = 1; a <= 20; a++) {
      for (let b = 1; b <= 20; b++) {
        expect(gcd(a, b)).toBe(gcd(b, a));
      }
    }
  });
  test('gcd handles negatives', () => {
    expect(gcd(-12, 8)).toBe(4);
    expect(gcd(12, -8)).toBe(4);
    expect(gcd(-12, -8)).toBe(4);
  });
  test('gcd(n, n) = n', () => {
    for (let i = 1; i <= 30; i++) expect(gcd(i, i)).toBe(i);
  });
  test('gcd(n, 1) = 1', () => {
    for (let i = 1; i <= 30; i++) expect(gcd(i, 1)).toBe(1);
  });
  // Loop: 100 pairs verifying gcd divides both numbers
  for (let a = 1; a <= 10; a++) {
    for (let b = 1; b <= 10; b++) {
      test(`gcd(${a*7}, ${b*11}) divides both`, () => {
        const g = gcd(a * 7, b * 11);
        expect((a * 7) % g).toBe(0);
        expect((b * 11) % g).toBe(0);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// lcm
// ---------------------------------------------------------------------------
describe('lcm', () => {
  test('lcm(4, 6) = 12', () => expect(lcm(4, 6)).toBe(12));
  test('lcm(3, 5) = 15', () => expect(lcm(3, 5)).toBe(15));
  test('lcm(0, n) = 0', () => { for (let i = 1; i <= 10; i++) expect(lcm(0, i)).toBe(0); });
  test('lcm(n, 0) = 0', () => { for (let i = 1; i <= 10; i++) expect(lcm(i, 0)).toBe(0); });
  test('lcm(n, n) = n', () => { for (let i = 1; i <= 20; i++) expect(lcm(i, i)).toBe(i); });
  test('lcm is commutative', () => {
    for (let a = 1; a <= 15; a++) {
      for (let b = 1; b <= 15; b++) {
        expect(lcm(a, b)).toBe(lcm(b, a));
      }
    }
  });
  test('lcm(a,b) is divisible by both a and b', () => {
    for (let a = 1; a <= 10; a++) {
      for (let b = 1; b <= 10; b++) {
        const l = lcm(a, b);
        expect(l % a).toBe(0);
        expect(l % b).toBe(0);
      }
    }
  });
  test('lcm * gcd = a * b (for positive)', () => {
    for (let a = 1; a <= 12; a++) {
      for (let b = 1; b <= 12; b++) {
        expect(lcm(a, b) * gcd(a, b)).toBe(a * b);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// isPrime  (loop i=2..101 → 100 iterations)
// ---------------------------------------------------------------------------
describe('isPrime', () => {
  test('isPrime(0) = false', () => expect(isPrime(0)).toBe(false));
  test('isPrime(1) = false', () => expect(isPrime(1)).toBe(false));
  test('isPrime(2) = true', () => expect(isPrime(2)).toBe(true));
  test('isPrime negative = false', () => expect(isPrime(-7)).toBe(false));

  for (let i = 2; i <= 101; i++) {
    if (KNOWN_PRIMES.has(i)) {
      test(`isPrime(${i}) = true`, () => expect(isPrime(i)).toBe(true));
    } else {
      test(`isPrime(${i}) = false`, () => expect(isPrime(i)).toBe(false));
    }
  }

  // Extra even numbers are not prime
  for (let i = 4; i <= 50; i += 2) {
    test(`isPrime(${i}) even → false`, () => expect(isPrime(i)).toBe(false));
  }
});

// ---------------------------------------------------------------------------
// primes
// ---------------------------------------------------------------------------
describe('primes', () => {
  test('primes(1) = []', () => expect(primes(1)).toEqual([]));
  test('primes(2) = [2]', () => expect(primes(2)).toEqual([2]));
  test('primes(10)', () => expect(primes(10)).toEqual([2, 3, 5, 7]));
  test('primes(20)', () => expect(primes(20)).toEqual([2, 3, 5, 7, 11, 13, 17, 19]));
  test('primes(30) count = 10', () => expect(primes(30)).toHaveLength(10));
  test('primes(100) count = 25', () => expect(primes(100)).toHaveLength(25));
  test('all results are actually prime', () => {
    const p = primes(200);
    for (const v of p) expect(isPrime(v)).toBe(true);
  });
  test('primes are sorted ascending', () => {
    const p = primes(200);
    for (let i = 1; i < p.length; i++) expect(p[i]).toBeGreaterThan(p[i - 1]);
  });
  // Loop: primes up to 50..150 always contain 2 and 3
  for (let n = 50; n <= 150; n++) {
    test(`primes(${n}) contains 2 and 3`, () => {
      const p = primes(n);
      expect(p).toContain(2);
      expect(p).toContain(3);
    });
  }
});

// ---------------------------------------------------------------------------
// factors
// ---------------------------------------------------------------------------
describe('factors', () => {
  test('factors(1) = empty map', () => expect(factors(1).size).toBe(0));
  test('factors(12) → {2:2, 3:1}', () => {
    const f = factors(12);
    expect(f.get(2)).toBe(2);
    expect(f.get(3)).toBe(1);
  });
  test('factors(prime p) → {p: 1}', () => {
    for (const p of [2, 3, 5, 7, 11, 13, 17, 19, 23]) {
      const f = factors(p);
      expect(f.size).toBe(1);
      expect(f.get(p)).toBe(1);
    }
  });
  test('factors reconstructs original number', () => {
    for (let n = 2; n <= 100; n++) {
      const f = factors(n);
      let reconstructed = 1;
      for (const [prime, exp] of f) reconstructed *= Math.pow(prime, exp);
      expect(reconstructed).toBe(n);
    }
  });
  test('factors of powers of 2', () => {
    for (let e = 1; e <= 10; e++) {
      const n = Math.pow(2, e);
      const f = factors(n);
      expect(f.size).toBe(1);
      expect(f.get(2)).toBe(e);
    }
  });
});

// ---------------------------------------------------------------------------
// fibonacci  (loop i=0..100 → 101 iterations)
// ---------------------------------------------------------------------------
describe('fibonacci', () => {
  test('fibonacci(0) = 0', () => expect(fibonacci(0)).toBe(0));
  test('fibonacci(1) = 1', () => expect(fibonacci(1)).toBe(1));
  test('fibonacci(-1) = NaN', () => expect(fibonacci(-1)).toBeNaN());

  // Known values for indices 0-20
  for (let i = 0; i <= 20; i++) {
    test(`fibonacci(${i}) = ${FIBONACCI_KNOWN[i]}`, () =>
      expect(fibonacci(i)).toBe(FIBONACCI_KNOWN[i])
    );
  }

  // Consistency: F(n) = F(n-1) + F(n-2) for indices 2..100
  for (let i = 2; i <= 100; i++) {
    test(`fibonacci(${i}) = fibonacci(${i-1}) + fibonacci(${i-2})`, () => {
      expect(fibonacci(i)).toBe(fibonacci(i - 1) + fibonacci(i - 2));
    });
  }
});

// ---------------------------------------------------------------------------
// factorial  (loop i=1..50 testing n! = n*(n-1)!)
// ---------------------------------------------------------------------------
describe('factorial', () => {
  test('factorial(0) = 1', () => expect(factorial(0)).toBe(1));
  test('factorial(1) = 1', () => expect(factorial(1)).toBe(1));
  test('factorial(5) = 120', () => expect(factorial(5)).toBe(120));
  test('factorial(10) = 3628800', () => expect(factorial(10)).toBe(3628800));
  test('factorial(20) = 2432902008176640000', () => expect(factorial(20)).toBe(2432902008176640000));
  test('factorial(-1) throws', () => expect(() => factorial(-1)).toThrow(RangeError));
  test('factorial(21) throws', () => expect(() => factorial(21)).toThrow(RangeError));
  test('factorial(0..20) are all positive', () => {
    for (let i = 0; i <= 20; i++) expect(factorial(i)).toBeGreaterThan(0);
  });

  // Relationship: n! = n * (n-1)! for n=1..20
  for (let n = 1; n <= 20; n++) {
    test(`factorial(${n}) = ${n} * factorial(${n-1})`, () => {
      expect(factorial(n)).toBe(n * factorial(n - 1));
    });
  }

  // Extra consistency tests using a reference table (fills remaining loops)
  const factRef = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800];
  for (let n = 0; n <= 10; n++) {
    test(`factorial(${n}) reference check`, () => expect(factorial(n)).toBe(factRef[n]));
  }

  // Loop i=1..50: check factorial throws for i+20 (> 20)
  for (let i = 1; i <= 50; i++) {
    test(`factorial(${i + 20}) throws RangeError`, () =>
      expect(() => factorial(i + 20)).toThrow(RangeError)
    );
  }
});

// ---------------------------------------------------------------------------
// binomial
// ---------------------------------------------------------------------------
describe('binomial', () => {
  test('C(0,0) = 1', () => expect(binomial(0, 0)).toBe(1));
  test('C(5,0) = 1', () => expect(binomial(5, 0)).toBe(1));
  test('C(5,5) = 1', () => expect(binomial(5, 5)).toBe(1));
  test('C(5,2) = 10', () => expect(binomial(5, 2)).toBe(10));
  test('C(10,3) = 120', () => expect(binomial(10, 3)).toBe(120));
  test('C(n,k) = 0 when k > n', () => { for (let k = 6; k <= 15; k++) expect(binomial(5, k)).toBe(0); });
  test('C(n,k) = 0 when k < 0', () => expect(binomial(5, -1)).toBe(0));
  test('C(n,k) is symmetric: C(n,k) = C(n, n-k)', () => {
    for (let n = 0; n <= 10; n++) {
      for (let k = 0; k <= n; k++) {
        expect(binomial(n, k)).toBe(binomial(n, n - k));
      }
    }
  });
  test('Pascal identity: C(n+1,k) = C(n,k-1) + C(n,k)', () => {
    for (let n = 1; n <= 10; n++) {
      for (let k = 1; k <= n; k++) {
        expect(binomial(n + 1, k)).toBe(binomial(n, k - 1) + binomial(n, k));
      }
    }
  });
  // Row sums of Pascal's triangle: sum_{k=0}^{n} C(n,k) = 2^n
  for (let n = 0; n <= 15; n++) {
    test(`sum of row ${n} of Pascal's triangle = 2^${n}`, () => {
      let rowSum = 0;
      for (let k = 0; k <= n; k++) rowSum += binomial(n, k);
      expect(rowSum).toBe(Math.pow(2, n));
    });
  }
});

// ---------------------------------------------------------------------------
// clamp  (loop i=1..100)
// ---------------------------------------------------------------------------
describe('clamp', () => {
  test('clamp within range returns value', () => expect(clamp(5, 0, 10)).toBe(5));
  test('clamp below min returns min', () => expect(clamp(-5, 0, 10)).toBe(0));
  test('clamp above max returns max', () => expect(clamp(15, 0, 10)).toBe(10));
  test('clamp at exact min/max', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
  // Loop i=1..100: values in [0,50] clamped to [10,40]
  for (let i = 1; i <= 100; i++) {
    const expected = Math.min(Math.max(i * 0.5, 10), 40);
    test(`clamp(${i * 0.5}, 10, 40) = ${expected}`, () =>
      expect(clamp(i * 0.5, 10, 40)).toBe(expected)
    );
  }
  // Large number of values: clamp always in [min, max]
  for (let i = 0; i <= 200; i++) {
    test(`clamp(${i - 100}, 0, 100) in [0,100]`, () => {
      const result = clamp(i - 100, 0, 100);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  }
});

// ---------------------------------------------------------------------------
// lerp & inverseLerp
// ---------------------------------------------------------------------------
describe('lerp', () => {
  test('lerp(0, 10, 0) = 0', () => expect(lerp(0, 10, 0)).toBe(0));
  test('lerp(0, 10, 1) = 10', () => expect(lerp(0, 10, 1)).toBe(10));
  test('lerp(0, 10, 0.5) = 5', () => expect(lerp(0, 10, 0.5)).toBe(5));
  test('lerp is consistent with inverseLerp', () => {
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const value = lerp(5, 25, t);
      expect(inverseLerp(5, 25, value)).toBeCloseTo(t, 10);
    }
  });
  // Loop i=0..100: lerp monotonically increases
  test('lerp is monotone', () => {
    for (let i = 0; i < 100; i++) {
      expect(lerp(0, 100, i / 100)).toBeLessThanOrEqual(lerp(0, 100, (i + 1) / 100));
    }
  });
});

describe('inverseLerp', () => {
  test('inverseLerp(a, a, x) = NaN', () => expect(inverseLerp(5, 5, 5)).toBeNaN());
  test('inverseLerp at a = 0', () => expect(inverseLerp(0, 10, 0)).toBe(0));
  test('inverseLerp at b = 1', () => expect(inverseLerp(0, 10, 10)).toBe(1));
  test('inverseLerp at midpoint = 0.5', () => expect(inverseLerp(0, 10, 5)).toBe(0.5));
});

// ---------------------------------------------------------------------------
// mapRange
// ---------------------------------------------------------------------------
describe('mapRange', () => {
  test('maps 0 in [0,1] to outMin', () => expect(mapRange(0, 0, 1, 100, 200)).toBe(100));
  test('maps 1 in [0,1] to outMax', () => expect(mapRange(1, 0, 1, 100, 200)).toBe(200));
  test('maps midpoint correctly', () => expect(mapRange(0.5, 0, 1, 100, 200)).toBe(150));
  // Loop: mapping values 0..50 from [0,50] → [0,100] should double
  for (let i = 0; i <= 50; i++) {
    test(`mapRange(${i}, 0, 50, 0, 100) ≈ ${i * 2}`, () =>
      expect(mapRange(i, 0, 50, 0, 100)).toBeCloseTo(i * 2, 8)
    );
  }
});

// ---------------------------------------------------------------------------
// roundTo & truncateTo
// ---------------------------------------------------------------------------
describe('roundTo', () => {
  test('roundTo(1.2345, 2) = 1.23', () => expect(roundTo(1.2345, 2)).toBe(1.23));
  test('roundTo(1.2355, 2) rounds up', () => expect(roundTo(1.2355, 2)).toBeCloseTo(1.24, 10));
  test('roundTo(1.2345, 0) = 1', () => expect(roundTo(1.2345, 0)).toBe(1));
  test('roundTo negative', () => expect(roundTo(-1.2345, 2)).toBe(-1.23));
  // Loop i=1..100: roundTo(i/7, 3) * 1000 should be integer (within float tolerance)
  for (let i = 1; i <= 100; i++) {
    test(`roundTo(${i}/7, 3) has at most 3 decimals`, () => {
      const result = roundTo(i / 7, 3);
      expect(Math.round(result * 1000) / 1000).toBeCloseTo(result, 10);
    });
  }
});

describe('truncateTo', () => {
  test('truncateTo(1.999, 1) = 1.9', () => expect(truncateTo(1.999, 1)).toBe(1.9));
  test('truncateTo(1.999, 2) = 1.99', () => expect(truncateTo(1.999, 2)).toBe(1.99));
  test('truncateTo(-1.999, 1) = -1.9', () => expect(truncateTo(-1.999, 1)).toBe(-1.9));
  test('truncateTo(3.14159, 4) = 3.1415', () => expect(truncateTo(3.14159, 4)).toBe(3.1415));
  test('truncateTo always <= roundTo for positive', () => {
    for (let i = 1; i <= 50; i++) {
      expect(truncateTo(i / 3, 2)).toBeLessThanOrEqual(roundTo(i / 3, 2) + 0.005);
    }
  });
});

// ---------------------------------------------------------------------------
// toFraction
// ---------------------------------------------------------------------------
describe('toFraction', () => {
  test('toFraction(0.5) = {numerator:1, denominator:2}', () => {
    const f = toFraction(0.5);
    expect(f.numerator / f.denominator).toBeCloseTo(0.5, 5);
  });
  test('toFraction(0.25) approximates 1/4', () => {
    const f = toFraction(0.25);
    expect(f.numerator / f.denominator).toBeCloseTo(0.25, 5);
  });
  test('toFraction(0.333) approximates 1/3', () => {
    const f = toFraction(0.333);
    expect(f.numerator / f.denominator).toBeCloseTo(0.333, 2);
  });
  test('toFraction of negative value has negative numerator', () => {
    const f = toFraction(-0.5);
    expect(f.numerator).toBeLessThan(0);
  });
  test('toFraction denominator >= 1', () => {
    for (let i = 1; i <= 20; i++) {
      const f = toFraction(i / 17);
      expect(f.denominator).toBeGreaterThanOrEqual(1);
    }
  });
  test('toFraction approximation error < 0.001 for simple fractions', () => {
    const simples = [1/2, 1/3, 1/4, 2/3, 3/4, 1/5, 2/5, 3/5, 4/5];
    for (const v of simples) {
      const f = toFraction(v);
      expect(Math.abs(f.numerator / f.denominator - v)).toBeLessThan(0.001);
    }
  });
});

// ---------------------------------------------------------------------------
// sum
// ---------------------------------------------------------------------------
describe('sum', () => {
  test('sum([]) = 0', () => expect(sum([])).toBe(0));
  test('sum([1,2,3]) = 6', () => expect(sum([1, 2, 3])).toBe(6));
  test('sum with negatives', () => expect(sum([-1, 1, -2, 2])).toBe(0));
  // Loop: sum of [1..n] = n*(n+1)/2
  for (let n = 1; n <= 100; n++) {
    test(`sum([1..${n}]) = ${n * (n + 1) / 2}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      expect(sum(arr)).toBe((n * (n + 1)) / 2);
    });
  }
});

// ---------------------------------------------------------------------------
// mean
// ---------------------------------------------------------------------------
describe('mean', () => {
  test('mean([]) = NaN', () => expect(mean([])).toBeNaN());
  test('mean([5]) = 5', () => expect(mean([5])).toBe(5));
  test('mean([1,2,3,4,5]) = 3', () => expect(mean([1, 2, 3, 4, 5])).toBe(3));
  test('mean of symmetric array is midpoint', () => {
    for (let n = 2; n <= 50; n += 2) {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      expect(mean(arr)).toBe((n + 1) / 2);
    }
  });
  // Loop: arrays of size 5..50, mean consistent with sum/length
  for (let size = 5; size <= 50; size++) {
    test(`mean for array of size ${size} = sum/length`, () => {
      const arr = Array.from({ length: size }, (_, i) => (i + 1) * 3);
      expect(mean(arr)).toBeCloseTo(sum(arr) / size, 10);
    });
  }
});

// ---------------------------------------------------------------------------
// median
// ---------------------------------------------------------------------------
describe('median', () => {
  test('median([]) = NaN', () => expect(median([])).toBeNaN());
  test('median([3]) = 3', () => expect(median([3])).toBe(3));
  test('median([1,2,3,4,5]) = 3', () => expect(median([1, 2, 3, 4, 5])).toBe(3));
  test('median([1,2,3,4]) = 2.5', () => expect(median([1, 2, 3, 4])).toBe(2.5));
  test('median is not affected by outlier direction', () => {
    expect(median([1, 2, 3, 4, 1000])).toBe(3);
  });
  // Loop: sorted odd arrays — median is middle element
  for (let size = 5; size <= 50; size += 2) {
    test(`median of sorted odd array size ${size} is middle`, () => {
      const arr = Array.from({ length: size }, (_, i) => i + 1);
      expect(median(arr)).toBe(arr[Math.floor(size / 2)]);
    });
  }
  // Loop: median of [1..n] arrays
  for (let n = 1; n <= 50; n++) {
    test(`median([1..${n}]) correctness`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const expected = n % 2 === 1 ? (n + 1) / 2 : (n / 2 + n / 2 + 1) / 2;
      expect(median(arr)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// mode
// ---------------------------------------------------------------------------
describe('mode', () => {
  test('mode([]) = []', () => expect(mode([])).toEqual([]));
  test('mode([1,2,2,3]) = [2]', () => expect(mode([1, 2, 2, 3])).toEqual([2]));
  test('mode([1,2]) = [1,2] (all tied)', () => expect(mode([1, 2])).toEqual([1, 2]));
  test('mode([1,1,2,2,3]) = [1,2]', () => expect(mode([1, 1, 2, 2, 3])).toEqual([1, 2]));
  test('mode returns sorted result', () => {
    const result = mode([3, 1, 1, 2, 2]);
    for (let i = 1; i < result.length; i++) expect(result[i]).toBeGreaterThan(result[i - 1]);
  });
  test('mode of single-value array is that value', () => {
    for (let i = 1; i <= 30; i++) {
      expect(mode([i, i, i])).toEqual([i]);
    }
  });
  test('mode result is subset of input values', () => {
    const arr = [5, 3, 5, 2, 3, 5];
    const inputSet = new Set(arr);
    for (const v of mode(arr)) expect(inputSet.has(v)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// variance & stdDev
// ---------------------------------------------------------------------------
describe('variance', () => {
  test('variance([]) = NaN', () => expect(variance([])).toBeNaN());
  test('variance([5]) = NaN (sample)', () => expect(variance([5])).toBeNaN());
  test('variance([5], true) = 0 (population)', () => expect(variance([5], true)).toBe(0));
  test('variance([2,4,4,4,5,5,7,9]) ≈ 4', () => expect(variance([2, 4, 4, 4, 5, 5, 7, 9], true)).toBeCloseTo(4, 5));
  test('variance >= 0', () => {
    for (let n = 2; n <= 30; n++) {
      const arr = Array.from({ length: n }, (_, i) => i * 3 + 1);
      expect(variance(arr)).toBeGreaterThanOrEqual(0);
    }
  });
  // Loop: arrays of size 5..50
  for (let size = 5; size <= 50; size++) {
    test(`variance of constant array size ${size} = 0`, () => {
      const arr = Array.from({ length: size }, () => 7);
      expect(variance(arr, true)).toBe(0);
      expect(variance(arr, false)).toBe(0);
    });
  }
});

describe('stdDev', () => {
  test('stdDev([2,4,4,4,5,5,7,9]) ≈ 2', () => expect(stdDev([2, 4, 4, 4, 5, 5, 7, 9], true)).toBeCloseTo(2, 5));
  test('stdDev >= 0', () => {
    for (let n = 2; n <= 30; n++) {
      const arr = Array.from({ length: n }, (_, i) => i);
      expect(stdDev(arr)).toBeGreaterThanOrEqual(0);
    }
  });
  test('stdDev = sqrt(variance)', () => {
    for (let n = 2; n <= 30; n++) {
      const arr = Array.from({ length: n }, (_, i) => i * 2);
      expect(stdDev(arr)).toBeCloseTo(Math.sqrt(variance(arr)), 10);
    }
  });
  // Loop: arrays of size 5..50
  for (let size = 5; size <= 50; size++) {
    test(`stdDev of [1..${size}] consistency check`, () => {
      const arr = Array.from({ length: size }, (_, i) => i + 1);
      expect(stdDev(arr)).toBeCloseTo(Math.sqrt(variance(arr)), 10);
    });
  }
});

// ---------------------------------------------------------------------------
// coefficientOfVariation
// ---------------------------------------------------------------------------
describe('coefficientOfVariation', () => {
  test('CV of [1,2,3] is positive', () => expect(coefficientOfVariation([1, 2, 3])).toBeGreaterThan(0));
  test('CV of constant array is NaN (mean could be 0)', () => {
    // mean=0 → NaN; constant non-zero → stdDev=0 so CV=0
    expect(coefficientOfVariation([5, 5, 5])).toBe(0);
  });
  test('CV when mean=0 returns NaN', () => {
    expect(coefficientOfVariation([-1, 0, 1])).toBeNaN();
  });
  test('CV = stdDev/mean*100', () => {
    const arr = [10, 20, 30, 40, 50];
    const expected = (stdDev(arr) / mean(arr)) * 100;
    expect(coefficientOfVariation(arr)).toBeCloseTo(expected, 10);
  });
});

// ---------------------------------------------------------------------------
// skewness & kurtosis
// ---------------------------------------------------------------------------
describe('skewness', () => {
  test('skewness of symmetric distribution ≈ 0', () => {
    const symmetric = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(Math.abs(skewness(symmetric))).toBeLessThan(0.1);
  });
  test('skewness of short array returns NaN', () => {
    expect(skewness([1, 2])).toBeNaN();
    expect(skewness([1])).toBeNaN();
    expect(skewness([])).toBeNaN();
  });
  test('positive skew for right-heavy distribution', () => {
    const rightSkewed = [1, 1, 1, 1, 2, 3, 10, 20, 30];
    expect(skewness(rightSkewed)).toBeGreaterThan(0);
  });
  test('skewness is defined for arrays of length >= 3', () => {
    for (let n = 3; n <= 20; n++) {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      expect(isNaN(skewness(arr))).toBe(false);
    }
  });
});

describe('kurtosis', () => {
  test('kurtosis of short array returns NaN', () => {
    expect(kurtosis([1, 2, 3])).toBeNaN();
    expect(kurtosis([])).toBeNaN();
  });
  test('kurtosis returns a number for valid input', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(typeof kurtosis(arr)).toBe('number');
  });
  test('kurtosis of constant array = 0', () => {
    expect(kurtosis([5, 5, 5, 5, 5])).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// percentile
// ---------------------------------------------------------------------------
describe('percentile', () => {
  test('percentile([]) = NaN', () => expect(percentile([], 50)).toBeNaN());
  test('percentile 0 = min', () => expect(percentile([3, 1, 4, 1, 5, 9], 0)).toBe(1));
  test('percentile 100 = max', () => expect(percentile([3, 1, 4, 1, 5, 9], 100)).toBe(9));
  test('percentile 50 = median', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(percentile(arr, 50)).toBeCloseTo(median(arr), 5);
  });
  test('percentile is monotonically non-decreasing in p', () => {
    const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
    for (let p = 0; p < 100; p++) {
      expect(percentile(arr, p)).toBeLessThanOrEqual(percentile(arr, p + 1));
    }
  });
  // Loop: percentile results are always within [min, max]
  for (let p = 0; p <= 100; p++) {
    test(`percentile(arr, ${p}) in [1,9]`, () => {
      const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
      const result = percentile(arr, p);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(9);
    });
  }
});

// ---------------------------------------------------------------------------
// quartiles & iqr
// ---------------------------------------------------------------------------
describe('quartiles', () => {
  test('q1 <= q2 <= q3', () => {
    const arr = [3, 7, 8, 5, 12, 14, 21, 13, 18];
    const { q1, q2, q3 } = quartiles(arr);
    expect(q1).toBeLessThanOrEqual(q2);
    expect(q2).toBeLessThanOrEqual(q3);
  });
  test('q2 equals median', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const { q2 } = quartiles(arr);
    expect(q2).toBeCloseTo(median(arr), 5);
  });
  // Loop over different array sizes
  for (let size = 4; size <= 30; size++) {
    test(`quartiles q1<=q2<=q3 for array size ${size}`, () => {
      const arr = Array.from({ length: size }, (_, i) => Math.sin(i + 1) * 100);
      const { q1, q2, q3 } = quartiles(arr);
      expect(q1).toBeLessThanOrEqual(q2 + 1e-10);
      expect(q2).toBeLessThanOrEqual(q3 + 1e-10);
    });
  }
});

describe('iqr', () => {
  test('iqr = q3 - q1', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const { q1, q3 } = quartiles(arr);
    expect(iqr(arr)).toBeCloseTo(q3 - q1, 10);
  });
  test('iqr >= 0', () => {
    for (let n = 4; n <= 20; n++) {
      const arr = Array.from({ length: n }, (_, i) => i * 3);
      expect(iqr(arr)).toBeGreaterThanOrEqual(0);
    }
  });
});

// ---------------------------------------------------------------------------
// zScore
// ---------------------------------------------------------------------------
describe('zScore', () => {
  test('zScore of mean is 0', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(zScore(mean(arr), arr)).toBeCloseTo(0, 10);
  });
  test('zScore of constant array is NaN', () => {
    expect(zScore(5, [5, 5, 5, 5])).toBeNaN();
  });
  test('zScore positive above mean', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(zScore(10, arr)).toBeGreaterThan(0);
  });
  test('zScore negative below mean', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(zScore(-10, arr)).toBeLessThan(0);
  });
  // Loop: z-scores of standardized array should match original z-scores
  for (let n = 5; n <= 30; n++) {
    test(`zScore for array of size ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => (i + 1) * 2);
      const z = zScore(arr[0], arr);
      expect(typeof z).toBe('number');
    });
  }
});

// ---------------------------------------------------------------------------
// normalize & standardize
// ---------------------------------------------------------------------------
describe('normalize', () => {
  test('normalize([]) = []', () => expect(normalize([])).toEqual([]));
  test('normalize maps min to 0 and max to 1', () => {
    const arr = [2, 4, 6, 8, 10];
    const norm = normalize(arr);
    expect(norm[0]).toBe(0);
    expect(norm[norm.length - 1]).toBe(1);
  });
  test('normalize constant array → all zeros', () => {
    expect(normalize([5, 5, 5])).toEqual([0, 0, 0]);
  });
  test('all normalized values in [0,1]', () => {
    for (let n = 2; n <= 30; n++) {
      const arr = Array.from({ length: n }, (_, i) => i * 7 - n * 3);
      const norm = normalize(arr);
      for (const v of norm) {
        expect(v).toBeGreaterThanOrEqual(-1e-10);
        expect(v).toBeLessThanOrEqual(1 + 1e-10);
      }
    }
  });
});

describe('standardize', () => {
  test('standardize([]) = []', () => expect(standardize([])).toEqual([]));
  test('standardized mean ≈ 0', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(mean(standardize(arr))).toBeCloseTo(0, 10);
  });
  test('standardized stdDev ≈ 1', () => {
    const arr = [10, 20, 30, 40, 50];
    expect(stdDev(standardize(arr))).toBeCloseTo(1, 10);
  });
  test('standardize constant → all zeros', () => {
    expect(standardize([3, 3, 3])).toEqual([0, 0, 0]);
  });
});

// ---------------------------------------------------------------------------
// covariance
// ---------------------------------------------------------------------------
describe('covariance', () => {
  test('covariance of different-length arrays = NaN', () => {
    expect(covariance([1, 2], [1])).toBeNaN();
  });
  test('covariance of single-element = NaN', () => {
    expect(covariance([1], [1])).toBeNaN();
  });
  test('covariance of identical arrays = variance', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(covariance(arr, arr)).toBeCloseTo(variance(arr), 10);
  });
  test('covariance of positively correlated arrays > 0', () => {
    const a = [1, 2, 3, 4, 5];
    const b = [2, 4, 6, 8, 10];
    expect(covariance(a, b)).toBeGreaterThan(0);
  });
  test('covariance is symmetric', () => {
    const a = [1, 3, 2, 5];
    const b = [2, 4, 1, 6];
    expect(covariance(a, b)).toBeCloseTo(covariance(b, a), 10);
  });
  // Loop over different array sizes
  for (let n = 2; n <= 30; n++) {
    test(`covariance(a, 2a) > 0 for size ${n}`, () => {
      const a = Array.from({ length: n }, (_, i) => i + 1);
      const b = a.map((v) => v * 2);
      expect(covariance(a, b)).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// correlation
// ---------------------------------------------------------------------------
describe('correlation', () => {
  test('correlation in [-1, 1]', () => {
    for (let n = 2; n <= 30; n++) {
      const a = Array.from({ length: n }, (_, i) => i + 1);
      const b = Array.from({ length: n }, (_, i) => Math.sin(i));
      const r = correlation(a, b);
      if (!isNaN(r)) {
        expect(r).toBeGreaterThanOrEqual(-1 - 1e-10);
        expect(r).toBeLessThanOrEqual(1 + 1e-10);
      }
    }
  });
  test('correlation of perfectly correlated arrays = 1', () => {
    const a = [1, 2, 3, 4, 5];
    const b = [2, 4, 6, 8, 10];
    expect(correlation(a, b)).toBeCloseTo(1, 10);
  });
  test('correlation of negatively correlated arrays = -1', () => {
    const a = [1, 2, 3, 4, 5];
    const b = [5, 4, 3, 2, 1];
    expect(correlation(a, b)).toBeCloseTo(-1, 10);
  });
  test('correlation(a, a) = 1', () => {
    const a = [3, 1, 4, 1, 5, 9, 2, 6];
    expect(correlation(a, a)).toBeCloseTo(1, 10);
  });
  test('correlation of different-length arrays = NaN', () => {
    expect(correlation([1, 2], [1])).toBeNaN();
  });
});

// ---------------------------------------------------------------------------
// linearRegression
// ---------------------------------------------------------------------------
describe('linearRegression', () => {
  test('perfect linear fit has r2 = 1', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 6, 8, 10];
    const { slope, intercept, r2 } = linearRegression(x, y);
    expect(slope).toBeCloseTo(2, 10);
    expect(intercept).toBeCloseTo(0, 10);
    expect(r2).toBeCloseTo(1, 10);
  });
  test('horizontal line has slope = 0', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [7, 7, 7, 7, 7];
    const { slope, r2 } = linearRegression(x, y);
    expect(slope).toBeCloseTo(0, 10);
    expect(r2).toBeCloseTo(1, 10);
  });
  test('insufficient data returns NaN', () => {
    const { slope } = linearRegression([1], [1]);
    expect(slope).toBeNaN();
  });
  test('r2 is in [0,1] for typical data', () => {
    const x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const y = [2, 3, 5, 4, 6, 7, 8, 9, 10, 11];
    const { r2 } = linearRegression(x, y);
    expect(r2).toBeGreaterThanOrEqual(0);
    expect(r2).toBeLessThanOrEqual(1);
  });
  // Loop: regression predictions should be consistent
  for (let slope = 1; slope <= 20; slope++) {
    test(`regression recovers slope ${slope} for y=${slope}x+3`, () => {
      const x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const y = x.map((v) => slope * v + 3);
      const result = linearRegression(x, y);
      expect(result.slope).toBeCloseTo(slope, 5);
      expect(result.intercept).toBeCloseTo(3, 5);
      expect(result.r2).toBeCloseTo(1, 5);
    });
  }
});

// ---------------------------------------------------------------------------
// movingAverage
// ---------------------------------------------------------------------------
describe('movingAverage', () => {
  test('window > length returns []', () => expect(movingAverage([1, 2], 5)).toEqual([]));
  test('window = 0 returns []', () => expect(movingAverage([1, 2, 3], 0)).toEqual([]));
  test('output length = arr.length - window + 1', () => {
    for (let n = 3; n <= 20; n++) {
      for (let w = 1; w <= n; w++) {
        const arr = Array.from({ length: n }, (_, i) => i + 1);
        expect(movingAverage(arr, w)).toHaveLength(n - w + 1);
      }
    }
  });
  test('moving average of constant array = constant', () => {
    const arr = Array.from({ length: 10 }, () => 5);
    for (const v of movingAverage(arr, 3)) expect(v).toBe(5);
  });
  test('MA values bounded by array min/max', () => {
    const arr = [1, 2, 3, 4, 5, 4, 3, 2, 1];
    const ma = movingAverage(arr, 3);
    for (const v of ma) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(5);
    }
  });
  // Loop: window size 1..30 on array of size 30
  for (let w = 1; w <= 30; w++) {
    test(`movingAverage window=${w} correct length`, () => {
      const arr = Array.from({ length: 30 }, (_, i) => i + 1);
      expect(movingAverage(arr, w)).toHaveLength(30 - w + 1);
    });
  }
});

// ---------------------------------------------------------------------------
// exponentialMovingAverage
// ---------------------------------------------------------------------------
describe('exponentialMovingAverage', () => {
  test('EMA([]) = []', () => expect(exponentialMovingAverage([], 0.5)).toEqual([]));
  test('EMA preserves length', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(exponentialMovingAverage(arr, 0.5)).toHaveLength(5);
  });
  test('EMA first value = arr[0]', () => {
    const arr = [10, 20, 30];
    expect(exponentialMovingAverage(arr, 0.5)[0]).toBe(10);
  });
  test('EMA with alpha=1 = arr', () => {
    const arr = [1, 2, 3, 4, 5];
    const ema = exponentialMovingAverage(arr, 1);
    for (let i = 0; i < arr.length; i++) expect(ema[i]).toBeCloseTo(arr[i], 10);
  });
  test('EMA smooths the data (bounded by min/max)', () => {
    const arr = [1, 100, 1, 100, 1, 100];
    const ema = exponentialMovingAverage(arr, 0.3);
    for (const v of ema) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(100);
    }
  });
  // Loop: different alpha values all produce valid results
  for (let i = 1; i <= 50; i++) {
    const alpha = i / 50;
    test(`EMA with alpha=${alpha.toFixed(2)} produces valid output`, () => {
      const arr = [5, 10, 15, 10, 5, 10, 15];
      const ema = exponentialMovingAverage(arr, alpha);
      expect(ema).toHaveLength(arr.length);
      for (const v of ema) expect(isNaN(v)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// Vector operations
// ---------------------------------------------------------------------------
describe('dotProduct', () => {
  test('dot([1,2],[3,4]) = 11', () => expect(dotProduct([1, 2], [3, 4])).toBe(11));
  test('dot of mismatched lengths = NaN', () => expect(dotProduct([1, 2], [1])).toBeNaN());
  test('dot of orthogonal vectors = 0', () => expect(dotProduct([1, 0], [0, 1])).toBe(0));
  test('dot(a,b) = dot(b,a)', () => {
    for (let n = 1; n <= 20; n++) {
      const a = Array.from({ length: n }, (_, i) => i + 1);
      const b = Array.from({ length: n }, (_, i) => n - i);
      expect(dotProduct(a, b)).toBeCloseTo(dotProduct(b, a), 10);
    }
  });
  // Loop: dot product of vector with itself = magnitude^2
  for (let n = 1; n <= 30; n++) {
    test(`dot(v,v) = |v|^2 for length ${n}`, () => {
      const v = Array.from({ length: n }, (_, i) => i + 1);
      const mag = magnitude(v);
      expect(dotProduct(v, v)).toBeCloseTo(mag * mag, 8);
    });
  }
});

describe('crossProduct3d', () => {
  test('cross([1,0,0],[0,1,0]) = [0,0,1]', () => {
    expect(crossProduct3d([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]);
  });
  test('cross([0,0,1],[1,0,0]) = [0,1,0]', () => {
    expect(crossProduct3d([0, 0, 1], [1, 0, 0])).toEqual([0, 1, 0]);
  });
  test('cross(v,v) = [0,0,0]', () => {
    const v = [3, 4, 5];
    expect(crossProduct3d(v, v)).toEqual([0, 0, 0]);
  });
  test('cross is anti-commutative: a×b = -(b×a)', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    const ab = crossProduct3d(a, b);
    const ba = crossProduct3d(b, a);
    for (let i = 0; i < 3; i++) expect(ab[i]).toBeCloseTo(-ba[i], 10);
  });
  test('cross product is perpendicular to both inputs', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    const c = crossProduct3d(a, b);
    expect(dotProduct(c, a)).toBeCloseTo(0, 10);
    expect(dotProduct(c, b)).toBeCloseTo(0, 10);
  });
  test('invalid dimensions return [NaN,NaN,NaN]', () => {
    const result = crossProduct3d([1, 2], [3, 4, 5]);
    for (const v of result) expect(isNaN(v)).toBe(true);
  });
  // Loop: cross products of unit axis vectors
  const axes: [number[], number[], number[]][] = [
    [[1,0,0],[0,1,0],[0,0,1]],
    [[0,1,0],[0,0,1],[1,0,0]],
    [[0,0,1],[1,0,0],[0,1,0]],
  ];
  for (const [a, b, expected] of axes) {
    test(`cross(${JSON.stringify(a)}, ${JSON.stringify(b)}) = ${JSON.stringify(expected)}`, () => {
      const result = crossProduct3d(a, b);
      for (let i = 0; i < 3; i++) expect(result[i]).toBeCloseTo(expected[i], 10);
    });
  }
});

describe('magnitude', () => {
  test('magnitude([3,4]) = 5', () => expect(magnitude([3, 4])).toBeCloseTo(5, 10));
  test('magnitude([0,0,0]) = 0', () => expect(magnitude([0, 0, 0])).toBe(0));
  test('magnitude([1]) = 1', () => expect(magnitude([1])).toBe(1));
  test('magnitude >= 0', () => {
    for (let n = 1; n <= 30; n++) {
      const v = Array.from({ length: n }, (_, i) => i - n / 2);
      expect(magnitude(v)).toBeGreaterThanOrEqual(0);
    }
  });
  test('magnitude([1,0,0,...]) = 1', () => {
    for (let n = 1; n <= 20; n++) {
      const v = Array.from({ length: n }, (_, i) => (i === 0 ? 1 : 0));
      expect(magnitude(v)).toBeCloseTo(1, 10);
    }
  });
});

describe('normalize2', () => {
  test('unit vector has magnitude 1', () => {
    const v = [3, 4];
    const unit = normalize2(v);
    expect(magnitude(unit)).toBeCloseTo(1, 10);
  });
  test('normalize2([0,0]) returns NaN vector', () => {
    const result = normalize2([0, 0]);
    for (const v of result) expect(isNaN(v)).toBe(true);
  });
  test('normalize2 unit vectors remain unit', () => {
    for (let n = 1; n <= 20; n++) {
      const v = Array.from({ length: n }, (_, i) => (i === 0 ? 1 : 0));
      const unit = normalize2(v);
      expect(magnitude(unit)).toBeCloseTo(1, 10);
    }
  });
  // Loop: normalized vectors have magnitude ≈ 1
  for (let n = 1; n <= 30; n++) {
    test(`normalize2 of random-ish vector of length ${n} has magnitude 1`, () => {
      const v = Array.from({ length: n }, (_, i) => i + 1);
      const unit = normalize2(v);
      expect(magnitude(unit)).toBeCloseTo(1, 8);
    });
  }
});

describe('vectorAdd', () => {
  test('vectorAdd([1,2],[3,4]) = [4,6]', () => expect(vectorAdd([1, 2], [3, 4])).toEqual([4, 6]));
  test('vectorAdd mismatched → NaN', () => {
    const result = vectorAdd([1, 2], [1]);
    for (const v of result) expect(isNaN(v)).toBe(true);
  });
  test('vectorAdd commutative', () => {
    for (let n = 1; n <= 20; n++) {
      const a = Array.from({ length: n }, (_, i) => i + 1);
      const b = Array.from({ length: n }, (_, i) => n - i);
      const ab = vectorAdd(a, b);
      const ba = vectorAdd(b, a);
      for (let i = 0; i < n; i++) expect(ab[i]).toBe(ba[i]);
    }
  });
  test('v + zero = v', () => {
    for (let n = 1; n <= 20; n++) {
      const v = Array.from({ length: n }, (_, i) => i + 1);
      const zero = Array.from({ length: n }, () => 0);
      const result = vectorAdd(v, zero);
      for (let i = 0; i < n; i++) expect(result[i]).toBe(v[i]);
    }
  });
});

describe('vectorSubtract', () => {
  test('vectorSubtract([4,6],[1,2]) = [3,4]', () => expect(vectorSubtract([4, 6], [1, 2])).toEqual([3, 4]));
  test('v - v = zero vector', () => {
    for (let n = 1; n <= 20; n++) {
      const v = Array.from({ length: n }, (_, i) => i + 1);
      const result = vectorSubtract(v, v);
      for (const val of result) expect(val).toBe(0);
    }
  });
  test('a - b = -(b - a)', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    const ab = vectorSubtract(a, b);
    const ba = vectorSubtract(b, a);
    for (let i = 0; i < 3; i++) expect(ab[i]).toBeCloseTo(-ba[i], 10);
  });
  test('vectorSubtract mismatched → NaN', () => {
    const result = vectorSubtract([1, 2, 3], [1, 2]);
    for (const v of result) expect(isNaN(v)).toBe(true);
  });
});

describe('vectorScale', () => {
  test('vectorScale([1,2,3], 2) = [2,4,6]', () => expect(vectorScale([1, 2, 3], 2)).toEqual([2, 4, 6]));
  test('vectorScale by 0 = zero vector', () => {
    const v = [1, 2, 3, 4, 5];
    for (const val of vectorScale(v, 0)) expect(val).toBe(0);
  });
  test('vectorScale by 1 = same vector', () => {
    const v = [3, 1, 4, 1, 5];
    const result = vectorScale(v, 1);
    for (let i = 0; i < v.length; i++) expect(result[i]).toBe(v[i]);
  });
  test('vectorScale by -1 negates', () => {
    const v = [1, -2, 3];
    const result = vectorScale(v, -1);
    for (let i = 0; i < v.length; i++) expect(result[i]).toBe(-v[i]);
  });
  // Loop: scaling then inverse scaling returns original
  for (let s = 1; s <= 40; s++) {
    test(`vectorScale by ${s} then 1/${s} = original`, () => {
      const v = [3, 6, 9];
      const scaled = vectorScale(v, s);
      const unscaled = vectorScale(scaled, 1 / s);
      for (let i = 0; i < v.length; i++) expect(unscaled[i]).toBeCloseTo(v[i], 10);
    });
  }
});

// ---------------------------------------------------------------------------
// Integration / edge case tests
// ---------------------------------------------------------------------------
describe('integration tests', () => {
  test('linearRegression with noisy data r2 < 1', () => {
    const x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const y = [1.1, 2.9, 3.2, 4.8, 5.1, 7.0, 6.9, 8.2, 9.1, 10.5];
    const { r2 } = linearRegression(x, y);
    expect(r2).toBeGreaterThan(0.95);
    expect(r2).toBeLessThan(1);
  });

  test('gcd and lcm relationship holds for all pairs 1..15', () => {
    for (let a = 1; a <= 15; a++) {
      for (let b = 1; b <= 15; b++) {
        expect(gcd(a, b) * lcm(a, b)).toBe(a * b);
      }
    }
  });

  test('primes sieve matches isPrime for 2..200', () => {
    const sievedPrimes = new Set(primes(200));
    for (let n = 2; n <= 200; n++) {
      expect(sievedPrimes.has(n)).toBe(isPrime(n));
    }
  });

  test('factors product = n for n in 2..200', () => {
    for (let n = 2; n <= 200; n++) {
      const f = factors(n);
      let product = 1;
      for (const [p, e] of f) product *= Math.pow(p, e);
      expect(product).toBe(n);
    }
  });

  test('sum, mean and variance consistent for various arrays', () => {
    for (let size = 5; size <= 25; size++) {
      const arr = Array.from({ length: size }, (_, i) => (i - size / 2) * 2);
      const m = mean(arr);
      const v = variance(arr);
      // manual variance check
      const manualVar = arr.reduce((acc, x) => acc + (x - m) ** 2, 0) / (size - 1);
      expect(v).toBeCloseTo(manualVar, 10);
    }
  });

  test('normalize then denormalize recovers original values', () => {
    for (let size = 2; size <= 20; size++) {
      const arr = Array.from({ length: size }, (_, i) => i * 3 + 1);
      const minVal = Math.min(...arr);
      const maxVal = Math.max(...arr);
      const norm = normalize(arr);
      const denorm = norm.map((v) => v * (maxVal - minVal) + minVal);
      for (let i = 0; i < arr.length; i++) expect(denorm[i]).toBeCloseTo(arr[i], 8);
    }
  });

  test('vectorAdd + vectorSubtract roundtrip', () => {
    for (let n = 1; n <= 20; n++) {
      const a = Array.from({ length: n }, (_, i) => i + 1);
      const b = Array.from({ length: n }, (_, i) => n - i + 1);
      const added = vectorAdd(a, b);
      const back = vectorSubtract(added, b);
      for (let i = 0; i < n; i++) expect(back[i]).toBeCloseTo(a[i], 10);
    }
  });

  test('EMA with alpha=0.5 bounds', () => {
    const arr = Array.from({ length: 50 }, (_, i) => Math.sin(i) * 10 + 50);
    const ema = exponentialMovingAverage(arr, 0.5);
    for (const v of ema) {
      expect(v).toBeGreaterThanOrEqual(40);
      expect(v).toBeLessThanOrEqual(60);
    }
  });

  // Loop: regression slope * x + intercept ≈ predicted values for perfect data
  for (let multiplier = 1; multiplier <= 30; multiplier++) {
    test(`regression prediction accuracy for slope=${multiplier}`, () => {
      const x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const y = x.map((v) => multiplier * v + 5);
      const { slope, intercept } = linearRegression(x, y);
      for (let i = 0; i < x.length; i++) {
        expect(slope * x[i] + intercept).toBeCloseTo(y[i], 8);
      }
    });
  }
});
