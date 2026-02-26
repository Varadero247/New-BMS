// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export function gcd(a: number, b: number): number {
  while (b) { [a, b] = [b, a % b]; } return Math.abs(a);
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

export function extendedGcd(a: number, b: number): { gcd: number; x: number; y: number } {
  if (b === 0) return { gcd: a, x: 1, y: 0 };
  const { gcd: g, x, y } = extendedGcd(b, a % b);
  return { gcd: g, x: y, y: x - Math.floor(a / b) * y };
}

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

export function sieve(limit: number): number[] {
  const isP = new Array(limit + 1).fill(true);
  isP[0] = isP[1] = false;
  for (let i = 2; i * i <= limit; i++) {
    if (isP[i]) for (let j = i * i; j <= limit; j += i) isP[j] = false;
  }
  return isP.map((v, i) => v ? i : -1).filter(v => v > 0);
}

export function primeFactors(n: number): number[] {
  const factors: number[] = [];
  let x = n;
  for (let i = 2; i * i <= x; i++) {
    while (x % i === 0) { factors.push(i); x = Math.floor(x / i); }
  }
  if (x > 1) factors.push(x);
  return factors;
}

export function primeFactorizationMap(n: number): Map<number, number> {
  const map = new Map<number, number>();
  const factors = primeFactors(n);
  for (const f of factors) map.set(f, (map.get(f) || 0) + 1);
  return map;
}

export function totient(n: number): number {
  let result = n;
  let x = n;
  for (let i = 2; i * i <= x; i++) {
    if (x % i === 0) {
      while (x % i === 0) x = Math.floor(x / i);
      result -= Math.floor(result / i);
    }
  }
  if (x > 1) result -= Math.floor(result / x);
  return result;
}

export function modPow(base: number, exp: number, mod: number): number {
  let result = 1;
  let b = ((base % mod) + mod) % mod;
  let e = exp;
  while (e > 0) {
    if (e & 1) result = (result * b) % mod;
    b = (b * b) % mod;
    e >>= 1;
  }
  return result;
}

export function modInverse(a: number, mod: number): number {
  const { gcd: g, x } = extendedGcd(a, mod);
  if (g !== 1) throw new Error('Inverse does not exist');
  return ((x % mod) + mod) % mod;
}

export function isSquare(n: number): boolean {
  if (n < 0) return false;
  const s = Math.round(Math.sqrt(n));
  return s * s === n;
}

export function intSqrt(n: number): number {
  if (n < 0) return -1;
  return Math.floor(Math.sqrt(n));
}

export function divisors(n: number): number[] {
  const divs: number[] = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) { divs.push(i); if (i !== Math.floor(n / i)) divs.push(Math.floor(n / i)); }
  }
  return divs.sort((a, b) => a - b);
}

export function numDivisors(n: number): number { return divisors(n).length; }

export function sumDivisors(n: number): number { return divisors(n).reduce((a, b) => a + b, 0); }

export function isPerfect(n: number): boolean { return n > 1 && sumDivisors(n) - n === n; }

export function isAbundant(n: number): boolean { return sumDivisors(n) - n > n; }

export function isDeficient(n: number): boolean { return sumDivisors(n) - n < n; }

export function fibonacci(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}

export function isFibonacci(n: number): boolean {
  return isSquare(5 * n * n + 4) || isSquare(5 * n * n - 4);
}

export function collatz(n: number): number[] {
  const seq = [n];
  let x = n;
  while (x !== 1) { x = x % 2 === 0 ? x / 2 : 3 * x + 1; seq.push(x); }
  return seq;
}

export function collatzLength(n: number): number { return collatz(n).length; }

export function digitalRoot(n: number): number {
  if (n === 0) return 0;
  return 1 + (n - 1) % 9;
}

export function reverseNumber(n: number): number {
  return parseInt(Math.abs(n).toString().split('').reverse().join(''), 10) * Math.sign(n);
}

export function isPalindrome(n: number): boolean {
  const s = Math.abs(n).toString();
  return s === s.split('').reverse().join('');
}

export function nthTriangular(n: number): number { return (n * (n + 1)) / 2; }
export function nthSquare(n: number): number { return n * n; }
export function nthPentagonal(n: number): number { return (n * (3 * n - 1)) / 2; }
export function nthHexagonal(n: number): number { return n * (2 * n - 1); }

export function chineseRemainderTheorem(remainders: number[], moduli: number[]): number {
  const M = moduli.reduce((a, b) => a * b, 1);
  let x = 0;
  for (let i = 0; i < remainders.length; i++) {
    const Mi = M / moduli[i];
    const yi = modInverse(Mi, moduli[i]);
    x += remainders[i] * Mi * yi;
  }
  return ((x % M) + M) % M;
}

export function jacobiSymbol(a: number, n: number): number {
  if (n <= 0 || n % 2 === 0) return 0;
  let result = 1;
  let aa = ((a % n) + n) % n;
  while (aa !== 0) {
    while (aa % 2 === 0) {
      aa /= 2;
      const r = n % 8;
      if (r === 3 || r === 5) result = -result;
    }
    [aa, n] = [n, aa];
    if (aa % 4 === 3 && n % 4 === 3) result = -result;
    aa = aa % n;
  }
  return n === 1 ? result : 0;
}

export function sumOfDigits(n: number): number {
  return Math.abs(n).toString().split('').reduce((a, d) => a + parseInt(d), 0);
}

export function productOfDigits(n: number): number {
  return Math.abs(n).toString().split('').reduce((a, d) => a * parseInt(d), 1);
}

export function isArmstrong(n: number): boolean {
  const s = n.toString();
  const k = s.length;
  return n >= 0 && parseInt(s.split('').reduce((a, d) => a + Math.pow(parseInt(d), k), 0).toString()) === n;
}

// Additional helpers preserved from original for backward compatibility
export function isCoprime(a: number, b: number): boolean { return gcd(a, b) === 1; }
export function nextPrime(n: number): number {
  let candidate = n + 1;
  while (!isPrime(candidate)) candidate++;
  return candidate;
}
export function digitSum(n: number): number { return sumOfDigits(n); }
