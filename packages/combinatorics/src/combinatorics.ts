// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export function factorial(n: number): number {
  if (n < 0) throw new Error('Negative input');
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export function factorialBigInt(n: number): bigint {
  let result = 1n;
  for (let i = 2n; i <= BigInt(n); i++) result *= i;
  return result;
}

// C(n, k) - binomial coefficient
export function combinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let c = 1;
  for (let i = 0; i < k; i++) { c = c * (n - i) / (i + 1); }
  return Math.round(c);
}

// P(n, k) - permutations
export function permutations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let p = 1;
  for (let i = 0; i < k; i++) p *= (n - i);
  return p;
}

// All permutations of an array
export function allPermutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr.slice()];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of allPermutations(rest)) result.push([arr[i], ...perm]);
  }
  return result;
}

// All combinations of k elements
export function allCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (k > arr.length) return [];
  const result: T[][] = [];
  function helper(start: number, current: T[]): void {
    if (current.length === k) { result.push([...current]); return; }
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      helper(i + 1, current);
      current.pop();
    }
  }
  helper(0, []);
  return result;
}

// Power set (all subsets)
export function powerSet<T>(arr: T[]): T[][] {
  const result: T[][] = [[]];
  for (const elem of arr) {
    const len = result.length;
    for (let i = 0; i < len; i++) result.push([...result[i], elem]);
  }
  return result;
}

// Catalan number
export function catalan(n: number): number { return combinations(2 * n, n) / (n + 1); }

// Stirling numbers of the second kind S(n, k)
export function stirlingSecond(n: number, k: number): number {
  if (k === 0) return n === 0 ? 1 : 0;
  if (k === n) return 1;
  if (k > n || n === 0) return 0;
  return k * stirlingSecond(n - 1, k) + stirlingSecond(n - 1, k - 1);
}

// Bell number (sum of Stirling second kind)
export function bell(n: number): number {
  let sum = 0;
  for (let k = 0; k <= n; k++) sum += stirlingSecond(n, k);
  return sum;
}

// Pascal's triangle row n
export function pascalRow(n: number): number[] {
  const row = [1];
  for (let k = 1; k <= n; k++) row.push(row[k - 1] * (n - k + 1) / k);
  return row.map(Math.round);
}

// Multinomial coefficient
export function multinomial(ns: number[]): number {
  const total = ns.reduce((a, b) => a + b, 0);
  let result = factorial(total);
  for (const n of ns) result /= factorial(n);
  return Math.round(result);
}

// Derangements D(n): permutations with no fixed points
export function derangements(n: number): number {
  if (n === 0) return 1;
  if (n === 1) return 0;
  let a = 1, b = 0;
  for (let i = 2; i <= n; i++) { [a, b] = [b, (i - 1) * (a + b)]; }
  return b;
}

// Number of ways to partition n into exactly k parts
export function partitionK(n: number, k: number): number {
  if (k === 0) return n === 0 ? 1 : 0;
  if (n < k) return 0;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(k + 1).fill(0));
  dp[0][0] = 1;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= k; j++) {
    dp[i][j] = dp[i - 1][j - 1] + (i - j >= 0 ? dp[i - j][j] : 0);
  }
  return dp[n][k];
}

// Euler's totient-like: count k in [1,n] coprime to n
export function countCoprime(n: number): number {
  let count = 0;
  for (let k = 1; k <= n; k++) {
    let a = n, b = k;
    while (b) { [a, b] = [b, a % b]; }
    if (a === 1) count++;
  }
  return count;
}

// Next permutation in lexicographic order (in-place)
export function nextPermutation<T>(arr: T[]): boolean {
  const n = arr.length;
  let i = n - 2;
  while (i >= 0 && arr[i] >= arr[i + 1]) i--;
  if (i < 0) return false;
  let j = n - 1;
  while (arr[j] <= arr[i]) j--;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  let lo = i + 1, hi = n - 1;
  while (lo < hi) { [arr[lo], arr[hi]] = [arr[hi], arr[lo]]; lo++; hi--; }
  return true;
}

// kth permutation (0-indexed) of [0,1,...,n-1]
export function kthPermutation(n: number, k: number): number[] {
  const digits = Array.from({ length: n }, (_, i) => i);
  const result: number[] = [];
  let remaining = k;
  for (let i = n; i > 0; i--) {
    const f = factorial(i - 1);
    const idx = Math.floor(remaining / f);
    result.push(digits[idx]);
    digits.splice(idx, 1);
    remaining %= f;
  }
  return result;
}

// Rank of a permutation (0-indexed)
export function rankPermutation(perm: number[]): number {
  const n = perm.length;
  let rank = 0;
  for (let i = 0; i < n; i++) {
    let count = 0;
    for (let j = i + 1; j < n; j++) if (perm[j] < perm[i]) count++;
    rank += count * factorial(n - i - 1);
  }
  return rank;
}
