// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

export type Fn1D = (x: number) => number;

// Gradient descent for 1D function minimization
export function gradientDescent(fn: Fn1D, start: number, lr = 0.01, epochs = 1000, eps = 1e-8): number {
  let x = start;
  for (let i = 0; i < epochs; i++) {
    const grad = (fn(x + eps) - fn(x - eps)) / (2 * eps);
    x -= lr * grad;
  }
  return x;
}

// Golden section search for 1D minimization on [a, b]
export function goldenSectionSearch(fn: Fn1D, a: number, b: number, tol = 1e-9): number {
  const gr = (Math.sqrt(5) + 1) / 2;
  let c = b - (b - a) / gr;
  let d = a + (b - a) / gr;
  while (Math.abs(b - a) > tol) {
    if (fn(c) < fn(d)) b = d; else a = c;
    c = b - (b - a) / gr;
    d = a + (b - a) / gr;
  }
  return (a + b) / 2;
}

// Simulated annealing (minimize)
export function simulatedAnnealing(fn: Fn1D, start: number, T0 = 100, cooling = 0.995, steps = 1000): number {
  let x = start, best = x, T = T0;
  for (let i = 0; i < steps; i++) {
    const nx = x + (Math.random() - 0.5) * T;
    const delta = fn(nx) - fn(x);
    if (delta < 0 || Math.random() < Math.exp(-delta / T)) x = nx;
    if (fn(x) < fn(best)) best = x;
    T *= cooling;
  }
  return best;
}

// Binary search for monotone function (find x where fn(x) >= target)
export function binarySearch1D(fn: Fn1D, lo: number, hi: number, target: number, tol = 1e-9): number {
  while (hi - lo > tol) {
    const mid = (lo + hi) / 2;
    if (fn(mid) < target) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

// Ternary search for unimodal function minimum on [a, b]
export function ternarySearch(fn: Fn1D, a: number, b: number, tol = 1e-9): number {
  while (b - a > tol) {
    const m1 = a + (b - a) / 3;
    const m2 = b - (b - a) / 3;
    if (fn(m1) < fn(m2)) b = m2; else a = m1;
  }
  return (a + b) / 2;
}

// Gradient descent result quality: returns value at found minimum
export function minimize1D(fn: Fn1D, start: number): number {
  return fn(gradientDescent(fn, start));
}
