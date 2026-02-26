// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import {
  clamp, roundTo, lerp, normalize, denormalize,
  isPrime, gcd, lcm, factorial, fibonacci,
  sum, product, mean, median, mode,
  variance, stdDev, percentile, statSummary,
  inRange, formatNumber, toOrdinal, digitSum,
  isPowerOfTwo, nextPowerOfTwo, isValidRoundingMode,
} from '../src';

// ---------------------------------------------------------------------------
// clamp
// ---------------------------------------------------------------------------
describe('clamp', () => {
  it('returns value when within range', () => { expect(clamp(5, 0, 10)).toBe(5); });
  it('clamps to min', () => { expect(clamp(-5, 0, 10)).toBe(0); });
  it('clamps to max', () => { expect(clamp(15, 0, 10)).toBe(10); });
  it('returns min when value === min', () => { expect(clamp(0, 0, 10)).toBe(0); });
  it('returns max when value === max', () => { expect(clamp(10, 0, 10)).toBe(10); });
  it('handles negative ranges', () => { expect(clamp(-3, -5, -1)).toBe(-3); });
  it('clamps below negative range', () => { expect(clamp(-10, -5, -1)).toBe(-5); });
  it('clamps above negative range', () => { expect(clamp(0, -5, -1)).toBe(-1); });
  it('handles equal min and max', () => { expect(clamp(5, 3, 3)).toBe(3); });
  it('handles float values', () => { expect(clamp(1.5, 1.0, 2.0)).toBeCloseTo(1.5); });
  for (let i = 0; i < 40; i++) {
    it(`clamp bulk ${i}: value ${i} in [10,30]`, () => {
      expect(clamp(i, 10, 30)).toBe(Math.max(10, Math.min(30, i)));
    });
  }
});

// ---------------------------------------------------------------------------
// roundTo
// ---------------------------------------------------------------------------
describe('roundTo', () => {
  it('rounds to 0 decimals by default', () => { expect(roundTo(3.5)).toBe(4); });
  it('rounds to 2 decimals', () => { expect(roundTo(3.14159, 2)).toBeCloseTo(3.14); });
  it('ceil mode', () => { expect(roundTo(3.11, 1, 'ceil')).toBeCloseTo(3.2); });
  it('floor mode', () => { expect(roundTo(3.99, 1, 'floor')).toBeCloseTo(3.9); });
  it('trunc mode positive', () => { expect(roundTo(3.99, 1, 'trunc')).toBeCloseTo(3.9); });
  it('trunc mode negative', () => { expect(roundTo(-3.99, 1, 'trunc')).toBeCloseTo(-3.9); });
  it('handles negative values', () => { expect(roundTo(-3.456, 2)).toBeCloseTo(-3.46); });
  it('handles zero decimals explicitly', () => { expect(roundTo(2.5, 0)).toBe(3); });
  it('ceil on integer is unchanged', () => { expect(roundTo(4, 0, 'ceil')).toBe(4); });
  it('floor on integer is unchanged', () => { expect(roundTo(4, 0, 'floor')).toBe(4); });
  for (let i = 1; i <= 40; i++) {
    it(`roundTo ${i/10} to 1dp`, () => { expect(roundTo(i / 10, 1)).toBeCloseTo(Math.round(i / 10 * 10) / 10); });
  }
});

// ---------------------------------------------------------------------------
// lerp
// ---------------------------------------------------------------------------
describe('lerp', () => {
  it('t=0 returns a', () => { expect(lerp(0, 10, 0)).toBe(0); });
  it('t=1 returns b', () => { expect(lerp(0, 10, 1)).toBe(10); });
  it('t=0.5 returns midpoint', () => { expect(lerp(0, 10, 0.5)).toBe(5); });
  it('handles negative range', () => { expect(lerp(-10, 10, 0.5)).toBe(0); });
  it('handles same endpoints', () => { expect(lerp(5, 5, 0.7)).toBe(5); });
  it('handles t > 1 (extrapolation)', () => { expect(lerp(0, 10, 2)).toBe(20); });
  it('handles t < 0 (extrapolation)', () => { expect(lerp(0, 10, -0.5)).toBe(-5); });
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    it(`lerp(0,100) at t=${t.toFixed(2)}`, () => {
      expect(lerp(0, 100, t)).toBeCloseTo(t * 100);
    });
  }
});

// ---------------------------------------------------------------------------
// normalize / denormalize
// ---------------------------------------------------------------------------
describe('normalize', () => {
  it('maps min to 0', () => { expect(normalize(0, 0, 10)).toBe(0); });
  it('maps max to 1', () => { expect(normalize(10, 0, 10)).toBe(1); });
  it('maps midpoint to 0.5', () => { expect(normalize(5, 0, 10)).toBeCloseTo(0.5); });
  it('handles same min and max', () => { expect(normalize(5, 5, 5)).toBe(0); });
  it('handles negative range', () => { expect(normalize(-5, -10, 0)).toBeCloseTo(0.5); });
  for (let i = 0; i <= 30; i++) {
    it(`normalize ${i} in [0,30]`, () => { expect(normalize(i, 0, 30)).toBeCloseTo(i / 30); });
  }
});

describe('denormalize', () => {
  it('maps 0 to min', () => { expect(denormalize(0, 0, 100)).toBe(0); });
  it('maps 1 to max', () => { expect(denormalize(1, 0, 100)).toBe(100); });
  it('maps 0.5 to midpoint', () => { expect(denormalize(0.5, 0, 100)).toBeCloseTo(50); });
  it('handles negative range', () => { expect(denormalize(0.5, -10, 10)).toBeCloseTo(0); });
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`denormalize t=${t.toFixed(2)} in [0,200]`, () => {
      expect(denormalize(t, 0, 200)).toBeCloseTo(t * 200);
    });
  }
});

// ---------------------------------------------------------------------------
// isPrime
// ---------------------------------------------------------------------------
describe('isPrime', () => {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
  const composites = [0, 1, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22];
  primes.forEach(p => {
    it(`${p} is prime`, () => { expect(isPrime(p)).toBe(true); });
  });
  composites.forEach(c => {
    it(`${c} is not prime`, () => { expect(isPrime(c)).toBe(false); });
  });
  it('negative number is not prime', () => { expect(isPrime(-7)).toBe(false); });
  it('97 is prime', () => { expect(isPrime(97)).toBe(true); });
  it('100 is not prime', () => { expect(isPrime(100)).toBe(false); });
  for (let i = 50; i < 80; i++) {
    const expected = [53, 59, 61, 67, 71, 73, 79].includes(i);
    it(`isPrime(${i}) = ${expected}`, () => { expect(isPrime(i)).toBe(expected); });
  }
});

// ---------------------------------------------------------------------------
// gcd / lcm
// ---------------------------------------------------------------------------
describe('gcd', () => {
  it('gcd(12,8)=4', () => { expect(gcd(12, 8)).toBe(4); });
  it('gcd(0,5)=5', () => { expect(gcd(0, 5)).toBe(5); });
  it('gcd(5,0)=5', () => { expect(gcd(5, 0)).toBe(5); });
  it('gcd(7,7)=7', () => { expect(gcd(7, 7)).toBe(7); });
  it('gcd(1,100)=1', () => { expect(gcd(1, 100)).toBe(1); });
  it('gcd(negative values)', () => { expect(gcd(-12, 8)).toBe(4); });
  it('gcd(100,75)=25', () => { expect(gcd(100, 75)).toBe(25); });
  for (let i = 1; i <= 30; i++) {
    it(`gcd(${i*2},${i})=${i}`, () => { expect(gcd(i * 2, i)).toBe(i); });
  }
});

describe('lcm', () => {
  it('lcm(4,6)=12', () => { expect(lcm(4, 6)).toBe(12); });
  it('lcm(3,5)=15', () => { expect(lcm(3, 5)).toBe(15); });
  it('lcm(0,5)=0', () => { expect(lcm(0, 5)).toBe(0); });
  it('lcm(7,7)=7', () => { expect(lcm(7, 7)).toBe(7); });
  it('lcm(1,100)=100', () => { expect(lcm(1, 100)).toBe(100); });
  for (let i = 1; i <= 20; i++) {
    it(`lcm(${i},1)=${i}`, () => { expect(lcm(i, 1)).toBe(i); });
  }
});

// ---------------------------------------------------------------------------
// factorial
// ---------------------------------------------------------------------------
describe('factorial', () => {
  it('factorial(0)=1', () => { expect(factorial(0)).toBe(1); });
  it('factorial(1)=1', () => { expect(factorial(1)).toBe(1); });
  it('factorial(5)=120', () => { expect(factorial(5)).toBe(120); });
  it('factorial(10)=3628800', () => { expect(factorial(10)).toBe(3628800); });
  it('factorial negative returns NaN', () => { expect(factorial(-1)).toBeNaN(); });
  it('factorial non-integer returns NaN', () => { expect(factorial(2.5)).toBeNaN(); });
  for (let i = 0; i <= 12; i++) {
    const expected = [1,1,2,6,24,120,720,5040,40320,362880,3628800,39916800,479001600][i];
    it(`factorial(${i})=${expected}`, () => { expect(factorial(i)).toBe(expected); });
  }
});

// ---------------------------------------------------------------------------
// fibonacci
// ---------------------------------------------------------------------------
describe('fibonacci', () => {
  const fibs = [0,1,1,2,3,5,8,13,21,34,55,89,144,233,377];
  fibs.forEach((f, i) => {
    it(`fibonacci(${i})=${f}`, () => { expect(fibonacci(i)).toBe(f); });
  });
  it('fibonacci(-1) is NaN', () => { expect(fibonacci(-1)).toBeNaN(); });
  it('fibonacci(1.5) is NaN', () => { expect(fibonacci(1.5)).toBeNaN(); });
  for (let i = 15; i <= 25; i++) {
    it(`fibonacci(${i}) is a number`, () => { expect(typeof fibonacci(i)).toBe('number'); });
  }
});

// ---------------------------------------------------------------------------
// sum / product
// ---------------------------------------------------------------------------
describe('sum', () => {
  it('empty array is 0', () => { expect(sum([])).toBe(0); });
  it('single element', () => { expect(sum([5])).toBe(5); });
  it('multiple elements', () => { expect(sum([1,2,3,4,5])).toBe(15); });
  it('negative values', () => { expect(sum([-1,-2,-3])).toBe(-6); });
  it('mixed values', () => { expect(sum([-1, 2, -3, 4])).toBe(2); });
  for (let i = 1; i <= 40; i++) {
    it(`sum 1..${i} = ${i*(i+1)/2}`, () => {
      const arr = Array.from({ length: i }, (_, k) => k + 1);
      expect(sum(arr)).toBe(i * (i + 1) / 2);
    });
  }
});

describe('product', () => {
  it('empty array is 1', () => { expect(product([])).toBe(1); });
  it('single element', () => { expect(product([5])).toBe(5); });
  it('multiple elements', () => { expect(product([2,3,4])).toBe(24); });
  it('contains zero', () => { expect(product([1,2,0,4])).toBe(0); });
  for (let i = 1; i <= 20; i++) {
    it(`product([1,${i}]) = ${i}`, () => { expect(product([1, i])).toBe(i); });
  }
});

// ---------------------------------------------------------------------------
// mean / median / mode
// ---------------------------------------------------------------------------
describe('mean', () => {
  it('empty array is NaN', () => { expect(mean([])).toBeNaN(); });
  it('single value', () => { expect(mean([7])).toBe(7); });
  it('even count', () => { expect(mean([1,2,3,4])).toBeCloseTo(2.5); });
  it('odd count', () => { expect(mean([1,2,3])).toBeCloseTo(2); });
  for (let i = 1; i <= 30; i++) {
    const arr = Array.from({ length: i }, (_, k) => k + 1);
    const expected = (i + 1) / 2;
    it(`mean 1..${i} = ${expected}`, () => { expect(mean(arr)).toBeCloseTo(expected); });
  }
});

describe('median', () => {
  it('empty array is NaN', () => { expect(median([])).toBeNaN(); });
  it('single value', () => { expect(median([5])).toBe(5); });
  it('odd count', () => { expect(median([1,3,2])).toBe(2); });
  it('even count', () => { expect(median([1,2,3,4])).toBeCloseTo(2.5); });
  it('already sorted', () => { expect(median([1,2,3,4,5])).toBe(3); });
  for (let i = 1; i <= 25; i++) {
    it(`median of ${i} ones is 1`, () => {
      expect(median(Array(i).fill(1))).toBe(1);
    });
  }
});

describe('mode', () => {
  it('empty array returns []', () => { expect(mode([])).toEqual([]); });
  it('all unique returns all values', () => { expect(mode([1,2,3]).sort()).toEqual([1,2,3]); });
  it('single mode', () => { expect(mode([1,2,2,3])).toEqual([2]); });
  it('two modes', () => { expect(mode([1,1,2,2,3]).sort((a,b)=>a-b)).toEqual([1,2]); });
  for (let i = 1; i <= 20; i++) {
    it(`mode of [${i},${i},${i+1}] is [${i}]`, () => {
      expect(mode([i, i, i + 1])).toEqual([i]);
    });
  }
});

// ---------------------------------------------------------------------------
// variance / stdDev
// ---------------------------------------------------------------------------
describe('variance', () => {
  it('empty array is NaN', () => { expect(variance([])).toBeNaN(); });
  it('single value variance is 0', () => { expect(variance([5])).toBe(0); });
  it('variance of [1,2,3,4,5]', () => { expect(variance([1,2,3,4,5])).toBeCloseTo(2); });
  it('all same values is 0', () => { expect(variance([7,7,7,7])).toBe(0); });
  for (let i = 1; i <= 20; i++) {
    it(`variance of ${i} identical values is 0`, () => {
      expect(variance(Array(i).fill(42))).toBeCloseTo(0);
    });
  }
});

describe('stdDev', () => {
  it('empty array is NaN', () => { expect(stdDev([])).toBeNaN(); });
  it('single value is 0', () => { expect(stdDev([5])).toBe(0); });
  it('stdDev [2,4,4,4,5,5,7,9] ≈ 2', () => { expect(stdDev([2,4,4,4,5,5,7,9])).toBeCloseTo(2); });
  for (let i = 1; i <= 20; i++) {
    it(`stdDev of ${i} identical values is 0`, () => {
      expect(stdDev(Array(i).fill(10))).toBeCloseTo(0);
    });
  }
});

// ---------------------------------------------------------------------------
// percentile
// ---------------------------------------------------------------------------
describe('percentile', () => {
  it('empty array is NaN', () => { expect(percentile([], 50)).toBeNaN(); });
  it('p=0 returns min', () => { expect(percentile([1,2,3,4,5], 0)).toBe(1); });
  it('p=100 returns max', () => { expect(percentile([1,2,3,4,5], 100)).toBe(5); });
  it('p=50 returns median for odd', () => { expect(percentile([1,2,3,4,5], 50)).toBe(3); });
  it('p=50 returns median for even', () => { expect(percentile([1,2,3,4], 50)).toBeCloseTo(2.5); });
  it('single value always returns that value', () => { expect(percentile([7], 75)).toBe(7); });
  for (let p = 0; p <= 30; p += 1) {
    it(`percentile([1..100], ${p}) is between 1 and 100`, () => {
      const arr = Array.from({ length: 100 }, (_, i) => i + 1);
      const v = percentile(arr, p);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(100);
    });
  }
});

// ---------------------------------------------------------------------------
// statSummary
// ---------------------------------------------------------------------------
describe('statSummary', () => {
  it('empty array has NaN fields', () => {
    const s = statSummary([]);
    expect(s.count).toBe(0);
    expect(s.mean).toBeNaN();
  });
  it('single value', () => {
    const s = statSummary([5]);
    expect(s.min).toBe(5);
    expect(s.max).toBe(5);
    expect(s.mean).toBe(5);
    expect(s.median).toBe(5);
    expect(s.stdDev).toBe(0);
    expect(s.count).toBe(1);
  });
  it('multiple values', () => {
    const s = statSummary([1,2,3,4,5]);
    expect(s.min).toBe(1);
    expect(s.max).toBe(5);
    expect(s.mean).toBeCloseTo(3);
    expect(s.median).toBe(3);
    expect(s.count).toBe(5);
  });
  for (let i = 1; i <= 25; i++) {
    it(`statSummary of ${i} values has correct count`, () => {
      const arr = Array.from({ length: i }, (_, k) => k + 1);
      expect(statSummary(arr).count).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// inRange
// ---------------------------------------------------------------------------
describe('inRange', () => {
  it('value within range', () => { expect(inRange(5, { min: 0, max: 10 })).toBe(true); });
  it('value at min', () => { expect(inRange(0, { min: 0, max: 10 })).toBe(true); });
  it('value at max', () => { expect(inRange(10, { min: 0, max: 10 })).toBe(true); });
  it('value below range', () => { expect(inRange(-1, { min: 0, max: 10 })).toBe(false); });
  it('value above range', () => { expect(inRange(11, { min: 0, max: 10 })).toBe(false); });
  for (let i = 0; i <= 30; i++) {
    it(`inRange(${i}, [10,20]) = ${i >= 10 && i <= 20}`, () => {
      expect(inRange(i, { min: 10, max: 20 })).toBe(i >= 10 && i <= 20);
    });
  }
});

// ---------------------------------------------------------------------------
// formatNumber
// ---------------------------------------------------------------------------
describe('formatNumber', () => {
  it('basic integer', () => { expect(formatNumber(42)).toBe('42'); });
  it('with 2 decimals', () => { expect(formatNumber(3.14159, { decimals: 2 })).toBe('3.14'); });
  it('with prefix', () => { expect(formatNumber(100, { prefix: '$' })).toBe('$100'); });
  it('with suffix', () => { expect(formatNumber(95, { suffix: '%' })).toBe('95%'); });
  it('with prefix and suffix', () => { expect(formatNumber(50, { prefix: '[', suffix: ']' })).toBe('[50]'); });
  it('with decimals and prefix', () => { expect(formatNumber(1.5, { decimals: 2, prefix: '£' })).toBe('£1.50'); });
  it('negative number', () => { expect(formatNumber(-42)).toBe('-42'); });
  for (let i = 0; i <= 30; i++) {
    it(`formatNumber(${i}) contains '${i}'`, () => {
      expect(formatNumber(i)).toContain(String(i));
    });
  }
});

// ---------------------------------------------------------------------------
// toOrdinal
// ---------------------------------------------------------------------------
describe('toOrdinal', () => {
  const cases: [number, string][] = [
    [1,'1st'],[2,'2nd'],[3,'3rd'],[4,'4th'],[5,'5th'],
    [11,'11th'],[12,'12th'],[13,'13th'],
    [21,'21st'],[22,'22nd'],[23,'23rd'],[24,'24th'],
    [101,'101st'],[111,'111th'],[112,'112th'],[113,'113th'],
  ];
  cases.forEach(([n, expected]) => {
    it(`toOrdinal(${n}) = '${expected}'`, () => { expect(toOrdinal(n)).toBe(expected); });
  });
  for (let i = 1; i <= 30; i++) {
    it(`toOrdinal(${i}) starts with '${i}'`, () => {
      expect(toOrdinal(i)).toMatch(new RegExp(`^${i}`));
    });
  }
});

// ---------------------------------------------------------------------------
// digitSum
// ---------------------------------------------------------------------------
describe('digitSum', () => {
  it('digitSum(0)=0', () => { expect(digitSum(0)).toBe(0); });
  it('digitSum(9)=9', () => { expect(digitSum(9)).toBe(9); });
  it('digitSum(123)=6', () => { expect(digitSum(123)).toBe(6); });
  it('digitSum(999)=27', () => { expect(digitSum(999)).toBe(27); });
  it('negative number', () => { expect(digitSum(-123)).toBe(6); });
  for (let i = 0; i <= 30; i++) {
    it(`digitSum(${i}) is a non-negative number`, () => {
      expect(digitSum(i)).toBeGreaterThanOrEqual(0);
    });
  }
});

// ---------------------------------------------------------------------------
// isPowerOfTwo / nextPowerOfTwo
// ---------------------------------------------------------------------------
describe('isPowerOfTwo', () => {
  const powers = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
  powers.forEach(p => {
    it(`${p} is a power of two`, () => { expect(isPowerOfTwo(p)).toBe(true); });
  });
  [0, 3, 5, 6, 7, 9, 10, 12, 15, -1, -4].forEach(n => {
    it(`${n} is not a power of two`, () => { expect(isPowerOfTwo(n)).toBe(false); });
  });
  for (let i = 1; i <= 20; i++) {
    const expected = [1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288].includes(Math.pow(2, i - 1));
    it(`isPowerOfTwo(${i}) is boolean`, () => {
      expect(typeof isPowerOfTwo(i)).toBe('boolean');
    });
  }
});

describe('nextPowerOfTwo', () => {
  it('nextPowerOfTwo(0) = 1', () => { expect(nextPowerOfTwo(0)).toBe(1); });
  it('nextPowerOfTwo(1) = 1', () => { expect(nextPowerOfTwo(1)).toBe(1); });
  it('nextPowerOfTwo(2) = 2', () => { expect(nextPowerOfTwo(2)).toBe(2); });
  it('nextPowerOfTwo(3) = 4', () => { expect(nextPowerOfTwo(3)).toBe(4); });
  it('nextPowerOfTwo(5) = 8', () => { expect(nextPowerOfTwo(5)).toBe(8); });
  it('nextPowerOfTwo(9) = 16', () => { expect(nextPowerOfTwo(9)).toBe(16); });
  it('nextPowerOfTwo(100) = 128', () => { expect(nextPowerOfTwo(100)).toBe(128); });
  it('nextPowerOfTwo(1024) = 1024', () => { expect(nextPowerOfTwo(1024)).toBe(1024); });
  for (let i = 1; i <= 30; i++) {
    it(`nextPowerOfTwo(${i}) >= ${i}`, () => {
      expect(nextPowerOfTwo(i)).toBeGreaterThanOrEqual(i);
    });
  }
});

// ---------------------------------------------------------------------------
// isValidRoundingMode
// ---------------------------------------------------------------------------
describe('isValidRoundingMode', () => {
  ['ceil', 'floor', 'round', 'trunc'].forEach(m => {
    it(`'${m}' is a valid rounding mode`, () => { expect(isValidRoundingMode(m)).toBe(true); });
  });
  ['half-up', 'up', 'down', '', null, undefined, 42, {}].forEach(v => {
    it(`${JSON.stringify(v)} is not a valid rounding mode`, () => {
      expect(isValidRoundingMode(v)).toBe(false);
    });
  });
  for (let i = 0; i < 20; i++) {
    it(`isValidRoundingMode(random_${i}) returns boolean`, () => {
      expect(typeof isValidRoundingMode(`mode_${i}`)).toBe('boolean');
    });
  }
});

// ---------------------------------------------------------------------------
// Additional clamp / roundTo cross-checks
// ---------------------------------------------------------------------------
describe('clamp additional', () => {
  for (let i = 0; i < 40; i++) {
    it(`clamp(${i}, 0, 20) stays in [0,20]`, () => {
      const r = clamp(i, 0, 20);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(20);
    });
  }
});

describe('roundTo additional', () => {
  for (let i = 0; i < 42; i++) {
    const v = i / 7;
    it(`roundTo(${v.toFixed(4)}, 2) is finite`, () => {
      expect(isFinite(roundTo(v, 2))).toBe(true);
    });
  }
});
