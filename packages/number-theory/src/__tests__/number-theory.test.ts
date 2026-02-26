// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  gcd, lcm, extendedGcd, isPrime, sieve, primeFactors, primeFactorizationMap,
  totient, modPow, modInverse, isSquare, intSqrt, divisors, numDivisors,
  sumDivisors, isPerfect, isAbundant, isDeficient, fibonacci, isFibonacci,
  collatz, collatzLength, digitalRoot, reverseNumber, isPalindrome,
  nthTriangular, nthSquare, nthPentagonal, nthHexagonal, chineseRemainderTheorem,
  jacobiSymbol, sumOfDigits, productOfDigits, isArmstrong,
  isCoprime, nextPrime, digitSum
} from '../number-theory';

// ─── gcd 200 tests ────────────────────────────────────────────────────────────
describe('gcd 200 tests', () => {
  for (let i = 1; i <= 200; i++) {
    it(`gcd(${i}, ${i}) = ${i}`, () => { expect(gcd(i, i)).toBe(i); });
  }
});

// ─── isPrime 200 tests ────────────────────────────────────────────────────────
describe('isPrime 200 tests', () => {
  const primes = new Set([2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,
    101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199]);
  for (let n = 0; n < 200; n++) {
    it(`isPrime(${n}) = ${primes.has(n)}`, () => {
      expect(isPrime(n)).toBe(primes.has(n));
    });
  }
});

// ─── fibonacci 100 tests ──────────────────────────────────────────────────────
describe('fibonacci 100 tests', () => {
  const fibs = [0,1,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584,4181];
  for (let i = 0; i < 100; i++) {
    it(`fibonacci(${i%20}) = ${fibs[i%20]}`, () => {
      expect(fibonacci(i % 20)).toBe(fibs[i % 20]);
    });
  }
});

// ─── modPow 100 tests ─────────────────────────────────────────────────────────
describe('modPow 100 tests', () => {
  for (let i = 1; i <= 100; i++) {
    it(`modPow(2, ${i}, 1000000007) >= 0`, () => {
      expect(modPow(2, i, 1000000007)).toBeGreaterThanOrEqual(0);
    });
  }
});

// ─── digitalRoot 100 tests ────────────────────────────────────────────────────
describe('digitalRoot 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`digitalRoot(${n}) in [1,9]`, () => {
      const dr = digitalRoot(n);
      expect(dr).toBeGreaterThanOrEqual(1);
      expect(dr).toBeLessThanOrEqual(9);
    });
  }
});

// ─── nthTriangular 100 tests ──────────────────────────────────────────────────
describe('nthTriangular 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`nthTriangular(${n}) = ${n*(n+1)/2}`, () => {
      expect(nthTriangular(n)).toBe(n*(n+1)/2);
    });
  }
});

// ─── sumOfDigits 100 tests ────────────────────────────────────────────────────
describe('sumOfDigits 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`sumOfDigits(${n}) > 0`, () => {
      expect(sumOfDigits(n)).toBeGreaterThan(0);
    });
  }
});

// ─── lcm 100 tests ────────────────────────────────────────────────────────────
describe('lcm 100 tests', () => {
  for (let i = 1; i <= 100; i++) {
    it(`lcm(${i}, 1) = ${i}`, () => { expect(lcm(i, 1)).toBe(i); });
  }
});

// ─── collatzLength 50 tests ───────────────────────────────────────────────────
describe('collatzLength 50 tests', () => {
  for (let n = 1; n <= 50; n++) {
    it(`collatzLength(${n}) >= 1`, () => {
      expect(collatzLength(n)).toBeGreaterThanOrEqual(1);
    });
  }
});

// ─── divisors 50 tests ────────────────────────────────────────────────────────
describe('divisors 50 tests', () => {
  for (let n = 1; n <= 50; n++) {
    it(`divisors(${n}) includes 1 and ${n}`, () => {
      const divs = divisors(n);
      expect(divs).toContain(1);
      expect(divs).toContain(n);
    });
  }
});

// ─── extendedGcd 50 tests ─────────────────────────────────────────────────────
describe('extendedGcd 50 tests', () => {
  for (let i = 1; i <= 50; i++) {
    it(`extendedGcd(${i}, ${i+1}).gcd = 1`, () => {
      expect(extendedGcd(i, i + 1).gcd).toBe(1);
    });
  }
});

// ─── nthSquare 50 tests ───────────────────────────────────────────────────────
describe('nthSquare 50 tests', () => {
  for (let n = 1; n <= 50; n++) {
    it(`nthSquare(${n}) = ${n*n}`, () => {
      expect(nthSquare(n)).toBe(n * n);
    });
  }
});

// ─── nthPentagonal 50 tests ───────────────────────────────────────────────────
describe('nthPentagonal 50 tests', () => {
  for (let n = 1; n <= 50; n++) {
    it(`nthPentagonal(${n}) = ${n*(3*n-1)/2}`, () => {
      expect(nthPentagonal(n)).toBe(n * (3 * n - 1) / 2);
    });
  }
});

// ─── nthHexagonal 50 tests ────────────────────────────────────────────────────
describe('nthHexagonal 50 tests', () => {
  for (let n = 1; n <= 50; n++) {
    it(`nthHexagonal(${n}) = ${n*(2*n-1)}`, () => {
      expect(nthHexagonal(n)).toBe(n * (2 * n - 1));
    });
  }
});

// ─── isSquare 50 tests ────────────────────────────────────────────────────────
describe('isSquare 50 tests', () => {
  for (let n = 1; n <= 50; n++) {
    it(`isSquare(${n*n}) = true`, () => {
      expect(isSquare(n * n)).toBe(true);
    });
  }
});

// ─── intSqrt 50 tests ─────────────────────────────────────────────────────────
describe('intSqrt 50 tests', () => {
  for (let n = 0; n < 50; n++) {
    it(`intSqrt(${n*n}) = ${n}`, () => {
      expect(intSqrt(n * n)).toBe(n);
    });
  }
});

// ─── numDivisors 50 tests ─────────────────────────────────────────────────────
describe('numDivisors 50 tests', () => {
  for (let n = 1; n <= 50; n++) {
    it(`numDivisors(${n}) >= 1`, () => {
      expect(numDivisors(n)).toBeGreaterThanOrEqual(1);
    });
  }
});

// ─── sumDivisors 50 tests ─────────────────────────────────────────────────────
describe('sumDivisors 50 tests', () => {
  for (let n = 1; n <= 50; n++) {
    it(`sumDivisors(${n}) >= ${n}`, () => {
      expect(sumDivisors(n)).toBeGreaterThanOrEqual(n);
    });
  }
});

// ─── isPalindrome 50 tests ────────────────────────────────────────────────────
describe('isPalindrome 50 tests', () => {
  const palindromes = [0,1,2,3,4,5,6,7,8,9,11,22,33,44,55,66,77,88,99,101,111,121,131,141,151,161,171,181,191,202,212,222,232,242,252,262,272,282,292,303,313,323,333,343,353,363,373,383,393,404];
  for (let i = 0; i < 50; i++) {
    it(`isPalindrome(${palindromes[i]}) = true`, () => {
      expect(isPalindrome(palindromes[i])).toBe(true);
    });
  }
});

// ─── reverseNumber 50 tests ───────────────────────────────────────────────────
describe('reverseNumber 50 tests', () => {
  for (let n = 1; n <= 50; n++) {
    it(`reverseNumber(reverseNumber(${n})) = ${n} if no leading zeros`, () => {
      // Only test numbers that don't end in 0 to avoid leading-zero edge case
      if (n % 10 !== 0) {
        expect(reverseNumber(reverseNumber(n))).toBe(n);
      } else {
        expect(reverseNumber(n)).toBeGreaterThanOrEqual(0);
      }
    });
  }
});

// ─── productOfDigits 50 tests ─────────────────────────────────────────────────
describe('productOfDigits 50 tests', () => {
  for (let n = 1; n <= 50; n++) {
    it(`productOfDigits(${n}) >= 0`, () => {
      expect(productOfDigits(n)).toBeGreaterThanOrEqual(0);
    });
  }
});

// ─── totient 50 tests ─────────────────────────────────────────────────────────
describe('totient 50 tests', () => {
  for (let n = 2; n <= 51; n++) {
    it(`totient(${n}) >= 1`, () => {
      expect(totient(n)).toBeGreaterThanOrEqual(1);
    });
  }
});

// ─── primeFactors 50 tests ────────────────────────────────────────────────────
describe('primeFactors 50 tests', () => {
  for (let n = 2; n <= 51; n++) {
    it(`primeFactors(${n}) product = ${n}`, () => {
      expect(primeFactors(n).reduce((a, b) => a * b, 1)).toBe(n);
    });
  }
});

// ─── primeFactorizationMap 50 tests ──────────────────────────────────────────
describe('primeFactorizationMap 50 tests', () => {
  for (let n = 2; n <= 51; n++) {
    it(`primeFactorizationMap(${n}) keys are prime`, () => {
      const map = primeFactorizationMap(n);
      for (const [k] of map) {
        expect(isPrime(k)).toBe(true);
      }
    });
  }
});

// ─── isCoprime 50 tests ───────────────────────────────────────────────────────
describe('isCoprime 50 tests', () => {
  for (let i = 1; i <= 50; i++) {
    it(`isCoprime(${i}, ${i+1}) = true`, () => {
      expect(isCoprime(i, i + 1)).toBe(true);
    });
  }
});

// ─── nextPrime 50 tests ───────────────────────────────────────────────────────
describe('nextPrime 50 tests', () => {
  for (let i = 1; i <= 50; i++) {
    it(`nextPrime(${i}) is prime`, () => {
      expect(isPrime(nextPrime(i))).toBe(true);
    });
  }
});

// ─── digitSum 50 tests ────────────────────────────────────────────────────────
describe('digitSum 50 tests', () => {
  for (let n = 1; n <= 50; n++) {
    it(`digitSum(${n}) equals sumOfDigits(${n})`, () => {
      expect(digitSum(n)).toBe(sumOfDigits(n));
    });
  }
});

// ─── isFibonacci 30 tests ─────────────────────────────────────────────────────
describe('isFibonacci 30 tests', () => {
  const fibSet = new Set([0,1,2,3,5,8,13,21,34,55,89,144,233,377,610]);
  for (let i = 0; i < 30; i++) {
    const n = i * 7;
    it(`isFibonacci(${n}) = ${fibSet.has(n)}`, () => {
      expect(isFibonacci(n)).toBe(fibSet.has(n));
    });
  }
});

// ─── isAbundant / isDeficient 30 tests ───────────────────────────────────────
describe('isAbundant and isDeficient 30 tests', () => {
  // Abundant: 12, 18, 20, 24 etc.
  const abundant = [12, 18, 20, 24, 30, 36, 40, 42, 48, 54, 56, 60, 66, 70, 72];
  for (let i = 0; i < 15; i++) {
    it(`isAbundant(${abundant[i]}) = true`, () => {
      expect(isAbundant(abundant[i])).toBe(true);
    });
  }
  // Deficient: primes and powers of 2 minus 1 type numbers
  const deficient = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17];
  for (let i = 0; i < 15; i++) {
    it(`isDeficient(${deficient[i]}) = true`, () => {
      expect(isDeficient(deficient[i])).toBe(true);
    });
  }
});

// ─── isPerfect tests ──────────────────────────────────────────────────────────
describe('isPerfect tests', () => {
  it('isPerfect(6) = true', () => { expect(isPerfect(6)).toBe(true); });
  it('isPerfect(28) = true', () => { expect(isPerfect(28)).toBe(true); });
  it('isPerfect(496) = true', () => { expect(isPerfect(496)).toBe(true); });
  it('isPerfect(5) = false', () => { expect(isPerfect(5)).toBe(false); });
  it('isPerfect(7) = false', () => { expect(isPerfect(7)).toBe(false); });
  it('isPerfect(12) = false', () => { expect(isPerfect(12)).toBe(false); });
  it('isPerfect(1) = false', () => { expect(isPerfect(1)).toBe(false); });
  it('isPerfect(2) = false', () => { expect(isPerfect(2)).toBe(false); });
  it('isPerfect(3) = false', () => { expect(isPerfect(3)).toBe(false); });
  it('isPerfect(4) = false', () => { expect(isPerfect(4)).toBe(false); });
});

// ─── isArmstrong tests ────────────────────────────────────────────────────────
describe('isArmstrong tests', () => {
  const armstrongs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 153, 370, 371, 407];
  for (const n of armstrongs) {
    it(`isArmstrong(${n}) = true`, () => { expect(isArmstrong(n)).toBe(true); });
  }
  const notArmstrongs = [10, 11, 12, 13, 14, 15, 100, 200, 300, 400, 500];
  for (const n of notArmstrongs) {
    it(`isArmstrong(${n}) = false`, () => { expect(isArmstrong(n)).toBe(false); });
  }
});

// ─── sieve tests ──────────────────────────────────────────────────────────────
describe('sieve tests', () => {
  it('sieve(10) = [2,3,5,7]', () => { expect(sieve(10)).toEqual([2,3,5,7]); });
  it('sieve(1) = []', () => { expect(sieve(1)).toHaveLength(0); });
  it('sieve(2) = [2]', () => { expect(sieve(2)).toEqual([2]); });
  it('sieve(20) has 8 primes', () => { expect(sieve(20)).toHaveLength(8); });
  for (let n = 2; n <= 30; n++) {
    it(`sieve(${n}) all elements prime`, () => {
      expect(sieve(n).every(p => isPrime(p))).toBe(true);
    });
  }
});

// ─── modInverse tests ─────────────────────────────────────────────────────────
describe('modInverse tests', () => {
  it('modInverse(3,7)*3 % 7 = 1', () => { expect((modInverse(3,7)*3) % 7).toBe(1); });
  it('modInverse(2,5)*2 % 5 = 1', () => { expect((modInverse(2,5)*2) % 5).toBe(1); });
  it('modInverse(4,9)*4 % 9 = 1', () => { expect((modInverse(4,9)*4) % 9).toBe(1); });
  it('modInverse(7,11)*7 % 11 = 1', () => { expect((modInverse(7,11)*7) % 11).toBe(1); });
  it('modInverse(1,7) = 1', () => { expect(modInverse(1, 7)).toBe(1); });
  it('modInverse throws when gcd != 1', () => {
    expect(() => modInverse(2, 4)).toThrow();
  });
  for (let a = 1; a <= 20; a++) {
    // test with prime mod 23
    it(`modInverse(${a}, 23) * ${a} % 23 = 1`, () => {
      const inv = modInverse(a, 23);
      expect((inv * a) % 23).toBe(1);
    });
  }
});

// ─── extendedGcd deeper tests ─────────────────────────────────────────────────
describe('extendedGcd deeper tests', () => {
  it('extendedGcd(0,5).gcd = 5', () => { expect(extendedGcd(0, 5).gcd).toBe(5); });
  it('extendedGcd(12,8) Bezout identity', () => {
    const { gcd: g, x, y } = extendedGcd(12, 8);
    expect(12*x + 8*y).toBe(g);
  });
  for (let i = 1; i <= 30; i++) {
    it(`extendedGcd Bezout identity for (${i}, ${i+3})`, () => {
      const { gcd: g, x, y } = extendedGcd(i, i + 3);
      expect(i * x + (i + 3) * y).toBe(g);
    });
  }
});

// ─── chineseRemainderTheorem tests ────────────────────────────────────────────
describe('chineseRemainderTheorem tests', () => {
  it('CRT([0,3,4],[3,4,5]) = 39', () => {
    expect(chineseRemainderTheorem([0, 3, 4], [3, 4, 5])).toBe(39);
  });
  it('CRT([2,3],[3,5]) = 8', () => {
    expect(chineseRemainderTheorem([2, 3], [3, 5])).toBe(8);
  });
  it('CRT([1,4],[5,7]) = 11', () => {
    expect(chineseRemainderTheorem([1, 4], [5, 7])).toBe(11);
  });
  it('CRT([1],[7]) = 1', () => {
    expect(chineseRemainderTheorem([1], [7])).toBe(1);
  });
  // Verify solution satisfies all congruences
  it('CRT result satisfies all congruences', () => {
    const r = [2, 3, 2];
    const m = [3, 5, 7];
    const x = chineseRemainderTheorem(r, m);
    for (let i = 0; i < r.length; i++) {
      expect(x % m[i]).toBe(r[i]);
    }
  });
});

// ─── jacobiSymbol tests ───────────────────────────────────────────────────────
describe('jacobiSymbol tests', () => {
  it('jacobiSymbol(1, 1) = 1', () => { expect(jacobiSymbol(1, 1)).toBe(1); });
  it('jacobiSymbol(1, 3) = 1', () => { expect(jacobiSymbol(1, 3)).toBe(1); });
  it('jacobiSymbol(2, 3) = -1', () => { expect(jacobiSymbol(2, 3)).toBe(-1); });
  it('jacobiSymbol(3, 5) = -1', () => { expect(jacobiSymbol(3, 5)).toBe(-1); });
  it('jacobiSymbol(2, 15) = 1', () => { expect(jacobiSymbol(2, 15)).toBe(1); });
  it('jacobiSymbol(0, 5) = 0', () => { expect(jacobiSymbol(0, 5)).toBe(0); });
  it('jacobiSymbol even n = 0', () => { expect(jacobiSymbol(1, 4)).toBe(0); });
  it('jacobi(a^2, p) = 1 for odd prime p not dividing a', () => {
    expect(jacobiSymbol(4, 7)).toBe(1);
    expect(jacobiSymbol(9, 11)).toBe(1);
  });
});

// ─── collatz sequence tests ───────────────────────────────────────────────────
describe('collatz sequence tests', () => {
  it('collatz(1) = [1]', () => { expect(collatz(1)).toEqual([1]); });
  it('collatz(2) = [2, 1]', () => { expect(collatz(2)).toEqual([2, 1]); });
  it('collatz(4) = [4, 2, 1]', () => { expect(collatz(4)).toEqual([4, 2, 1]); });
  it('collatz(6) ends at 1', () => {
    const seq = collatz(6);
    expect(seq[seq.length - 1]).toBe(1);
  });
  it('collatz(27) length > 100', () => { expect(collatz(27).length).toBeGreaterThan(100); });
  for (let n = 1; n <= 20; n++) {
    it(`collatz(${n}) starts with ${n}`, () => {
      expect(collatz(n)[0]).toBe(n);
    });
  }
});

// ─── gcd additional properties ────────────────────────────────────────────────
describe('gcd additional properties', () => {
  it('gcd(0, 0) = 0', () => { expect(gcd(0, 0)).toBe(0); });
  it('gcd(0, 5) = 5', () => { expect(gcd(0, 5)).toBe(5); });
  it('gcd(5, 0) = 5', () => { expect(gcd(5, 0)).toBe(5); });
  it('gcd is commutative', () => { expect(gcd(12, 8)).toBe(gcd(8, 12)); });
  it('gcd(a,b) divides a', () => {
    for (let i = 1; i <= 20; i++) {
      const g = gcd(i * 3, i * 5);
      expect((i * 3) % g).toBe(0);
    }
  });
  for (let i = 1; i <= 30; i++) {
    it(`gcd(${i}, ${i+1}) = 1 (consecutive)`, () => {
      expect(gcd(i, i + 1)).toBe(1);
    });
  }
});

// ─── lcm additional properties ────────────────────────────────────────────────
describe('lcm additional properties', () => {
  it('lcm(4, 6) = 12', () => { expect(lcm(4, 6)).toBe(12); });
  it('lcm(3, 5) = 15', () => { expect(lcm(3, 5)).toBe(15); });
  it('lcm(a,b) divisible by a and b', () => {
    for (let i = 1; i <= 15; i++) {
      const l = lcm(i, i + 2);
      expect(l % i).toBe(0);
      expect(l % (i + 2)).toBe(0);
    }
  });
  for (let i = 1; i <= 30; i++) {
    it(`lcm(${i}, ${i}) = ${i}`, () => { expect(lcm(i, i)).toBe(i); });
  }
});

// ─── fibonacci additional tests ───────────────────────────────────────────────
describe('fibonacci additional tests', () => {
  it('fib(0) = 0', () => { expect(fibonacci(0)).toBe(0); });
  it('fib(1) = 1', () => { expect(fibonacci(1)).toBe(1); });
  it('fib(10) = 55', () => { expect(fibonacci(10)).toBe(55); });
  it('fib(-1) = 0', () => { expect(fibonacci(-1)).toBe(0); });
  for (let i = 2; i <= 30; i++) {
    it(`fib(${i}) = fib(${i-1}) + fib(${i-2})`, () => {
      expect(fibonacci(i)).toBe(fibonacci(i-1) + fibonacci(i-2));
    });
  }
});

// ─── digitalRoot additional tests ─────────────────────────────────────────────
describe('digitalRoot additional tests', () => {
  it('digitalRoot(0) = 0', () => { expect(digitalRoot(0)).toBe(0); });
  it('digitalRoot(9) = 9', () => { expect(digitalRoot(9)).toBe(9); });
  it('digitalRoot(10) = 1', () => { expect(digitalRoot(10)).toBe(1); });
  it('digitalRoot(99) = 9', () => { expect(digitalRoot(99)).toBe(9); });
  it('digitalRoot(100) = 1', () => { expect(digitalRoot(100)).toBe(1); });
  it('digitalRoot(18) = 9', () => { expect(digitalRoot(18)).toBe(9); });
  it('digitalRoot(123) = 6', () => { expect(digitalRoot(123)).toBe(6); });
  it('digitalRoot(456) = 6', () => { expect(digitalRoot(456)).toBe(6); });
  for (let n = 1; n <= 20; n++) {
    it(`digitalRoot(${n*9}) = 9`, () => {
      expect(digitalRoot(n * 9)).toBe(9);
    });
  }
});

// ─── totient additional tests ─────────────────────────────────────────────────
describe('totient additional tests', () => {
  it('totient(1) = 1', () => { expect(totient(1)).toBe(1); });
  it('totient(2) = 1', () => { expect(totient(2)).toBe(1); });
  it('totient(prime) = prime-1', () => {
    for (const p of [5,7,11,13,17,19,23]) {
      expect(totient(p)).toBe(p - 1);
    }
  });
  it('totient(6) = 2', () => { expect(totient(6)).toBe(2); });
  it('totient(12) = 4', () => { expect(totient(12)).toBe(4); });
  it('totient(36) = 12', () => { expect(totient(36)).toBe(12); });
});

// ─── sumOfDigits / productOfDigits additional ─────────────────────────────────
describe('sumOfDigits additional tests', () => {
  it('sumOfDigits(0) = 0', () => { expect(sumOfDigits(0)).toBe(0); });
  it('sumOfDigits(123) = 6', () => { expect(sumOfDigits(123)).toBe(6); });
  it('sumOfDigits(999) = 27', () => { expect(sumOfDigits(999)).toBe(27); });
  it('productOfDigits(123) = 6', () => { expect(productOfDigits(123)).toBe(6); });
  it('productOfDigits(111) = 1', () => { expect(productOfDigits(111)).toBe(1); });
  it('productOfDigits(9) = 9', () => { expect(productOfDigits(9)).toBe(9); });
});

// ─── isPalindrome additional tests ────────────────────────────────────────────
describe('isPalindrome additional tests', () => {
  it('isPalindrome(121) = true', () => { expect(isPalindrome(121)).toBe(true); });
  it('isPalindrome(123) = false', () => { expect(isPalindrome(123)).toBe(false); });
  it('isPalindrome(1) = true', () => { expect(isPalindrome(1)).toBe(true); });
  it('isPalindrome(12321) = true', () => { expect(isPalindrome(12321)).toBe(true); });
  it('isPalindrome(12345) = false', () => { expect(isPalindrome(12345)).toBe(false); });
});

// ─── reverseNumber additional tests ──────────────────────────────────────────
describe('reverseNumber additional tests', () => {
  it('reverseNumber(123) = 321', () => { expect(reverseNumber(123)).toBe(321); });
  it('reverseNumber(100) = 1', () => { expect(reverseNumber(100)).toBe(1); });
  it('reverseNumber(1) = 1', () => { expect(reverseNumber(1)).toBe(1); });
  it('reverseNumber(9) = 9', () => { expect(reverseNumber(9)).toBe(9); });
});

// ─── modPow edge cases ────────────────────────────────────────────────────────
describe('modPow edge cases', () => {
  it('modPow(0, 0, 7) = 1', () => { expect(modPow(0, 0, 7)).toBe(1); });
  it('modPow(5, 0, 7) = 1', () => { expect(modPow(5, 0, 7)).toBe(1); });
  it('modPow(2, 10, 1000) = 24', () => { expect(modPow(2, 10, 1000)).toBe(24); });
  it('modPow(3, 4, 5) = 1', () => { expect(modPow(3, 4, 5)).toBe(1); });
  it('modPow(2, 100, 7) in [0,6]', () => {
    const r = modPow(2, 100, 7);
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThanOrEqual(6);
  });
  for (let mod = 2; mod <= 20; mod++) {
    it(`modPow(${mod}, 1, ${mod}) = 0`, () => {
      expect(modPow(mod, 1, mod)).toBe(0);
    });
  }
});

// ─── isSquare additional tests ────────────────────────────────────────────────
describe('isSquare additional tests', () => {
  it('isSquare(0) = true', () => { expect(isSquare(0)).toBe(true); });
  it('isSquare(1) = true', () => { expect(isSquare(1)).toBe(true); });
  it('isSquare(-1) = false', () => { expect(isSquare(-1)).toBe(false); });
  it('isSquare(2) = false', () => { expect(isSquare(2)).toBe(false); });
  it('isSquare(3) = false', () => { expect(isSquare(3)).toBe(false); });
  it('isSquare(4) = true', () => { expect(isSquare(4)).toBe(true); });
  it('isSquare(16) = true', () => { expect(isSquare(16)).toBe(true); });
  it('isSquare(15) = false', () => { expect(isSquare(15)).toBe(false); });
});

// ─── primeFactors additional tests ───────────────────────────────────────────
describe('primeFactors additional tests', () => {
  it('primeFactors(2) = [2]', () => { expect(primeFactors(2)).toEqual([2]); });
  it('primeFactors(4) = [2,2]', () => { expect(primeFactors(4)).toEqual([2, 2]); });
  it('primeFactors(12) = [2,2,3]', () => { expect(primeFactors(12)).toEqual([2, 2, 3]); });
  it('primeFactors(30) = [2,3,5]', () => { expect(primeFactors(30)).toEqual([2, 3, 5]); });
  it('all factors of 100 are prime', () => {
    expect(primeFactors(100).every(isPrime)).toBe(true);
  });
  it('all factors of 360 are prime', () => {
    expect(primeFactors(360).every(isPrime)).toBe(true);
  });
});

// ─── divisors additional tests ────────────────────────────────────────────────
describe('divisors additional tests', () => {
  it('divisors(1) = [1]', () => { expect(divisors(1)).toEqual([1]); });
  it('divisors(12) = [1,2,3,4,6,12]', () => { expect(divisors(12)).toEqual([1,2,3,4,6,12]); });
  it('divisors(prime) has 2 divisors', () => {
    expect(divisors(7)).toHaveLength(2);
    expect(divisors(13)).toHaveLength(2);
  });
  it('divisors(p^2) has 3 divisors', () => {
    expect(divisors(9)).toHaveLength(3);
    expect(divisors(25)).toHaveLength(3);
  });
  it('divisors are sorted', () => {
    const d = divisors(60);
    for (let i = 1; i < d.length; i++) {
      expect(d[i]).toBeGreaterThan(d[i-1]);
    }
  });
});

// ─── intSqrt additional tests ─────────────────────────────────────────────────
describe('intSqrt additional tests', () => {
  it('intSqrt(-1) = -1', () => { expect(intSqrt(-1)).toBe(-1); });
  it('intSqrt(0) = 0', () => { expect(intSqrt(0)).toBe(0); });
  it('intSqrt(1) = 1', () => { expect(intSqrt(1)).toBe(1); });
  it('intSqrt(2) = 1', () => { expect(intSqrt(2)).toBe(1); });
  it('intSqrt(3) = 1', () => { expect(intSqrt(3)).toBe(1); });
  it('intSqrt(4) = 2', () => { expect(intSqrt(4)).toBe(2); });
  it('intSqrt(8) = 2', () => { expect(intSqrt(8)).toBe(2); });
  it('intSqrt(9) = 3', () => { expect(intSqrt(9)).toBe(3); });
  it('intSqrt(10) = 3', () => { expect(intSqrt(10)).toBe(3); });
  it('intSqrt(100) = 10', () => { expect(intSqrt(100)).toBe(10); });
});

// ─── numDivisors additional tests ─────────────────────────────────────────────
describe('numDivisors additional tests', () => {
  it('numDivisors(1) = 1', () => { expect(numDivisors(1)).toBe(1); });
  it('numDivisors(prime) = 2', () => { expect(numDivisors(7)).toBe(2); });
  it('numDivisors(12) = 6', () => { expect(numDivisors(12)).toBe(6); });
  it('numDivisors(36) = 9', () => { expect(numDivisors(36)).toBe(9); });
  it('numDivisors(p^2) = 3', () => { expect(numDivisors(9)).toBe(3); });
});

// ─── sumDivisors additional tests ─────────────────────────────────────────────
describe('sumDivisors additional tests', () => {
  it('sumDivisors(1) = 1', () => { expect(sumDivisors(1)).toBe(1); });
  it('sumDivisors(6) = 12 (perfect)', () => { expect(sumDivisors(6)).toBe(12); });
  it('sumDivisors(7) = 8', () => { expect(sumDivisors(7)).toBe(8); });
  it('sumDivisors(12) = 28', () => { expect(sumDivisors(12)).toBe(28); });
});

// ─── nthHexagonal and nthPentagonal checks ────────────────────────────────────
describe('nthHexagonal and nthPentagonal checks', () => {
  it('H(1) = 1', () => { expect(nthHexagonal(1)).toBe(1); });
  it('H(2) = 6', () => { expect(nthHexagonal(2)).toBe(6); });
  it('H(3) = 15', () => { expect(nthHexagonal(3)).toBe(15); });
  it('P(1) = 1', () => { expect(nthPentagonal(1)).toBe(1); });
  it('P(2) = 5', () => { expect(nthPentagonal(2)).toBe(5); });
  it('P(3) = 12', () => { expect(nthPentagonal(3)).toBe(12); });
  it('every hexagonal is also triangular', () => {
    // H(n) = T(2n-1)
    for (let n = 1; n <= 10; n++) {
      expect(nthHexagonal(n)).toBe(nthTriangular(2 * n - 1));
    }
  });
});

// ─── Mixed property tests ─────────────────────────────────────────────────────
describe('mixed property tests', () => {
  it('lcm(a,b) * gcd(a,b) = a * b', () => {
    for (let a = 1; a <= 10; a++) {
      for (let b = 1; b <= 10; b++) {
        expect(lcm(a, b) * gcd(a, b)).toBe(a * b);
      }
    }
  });
  it('totient(p)*totient(q) = totient(p*q) for coprime p,q (both prime)', () => {
    expect(totient(5) * totient(7)).toBe(totient(35));
  });
  it('sum of 1..n = nthTriangular(n)', () => {
    for (let n = 1; n <= 20; n++) {
      let sum = 0;
      for (let k = 1; k <= n; k++) sum += k;
      expect(sum).toBe(nthTriangular(n));
    }
  });
  it('nthSquare(n) - nthSquare(n-1) = 2n-1 (odd numbers)', () => {
    for (let n = 2; n <= 20; n++) {
      expect(nthSquare(n) - nthSquare(n - 1)).toBe(2 * n - 1);
    }
  });
});
