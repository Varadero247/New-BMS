// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type ObjectiveFn = (x: number[]) => number;

export interface OptimizationResult {
  x: number[];
  value: number;
  iterations: number;
  converged: boolean;
}

export interface Individual {
  genes: number[];
  fitness: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Numerical derivatives
// ──────────────────────────────────────────────────────────────────────────────

export function numericalGradient(fn: ObjectiveFn, x: number[], h = 1e-5): number[] {
  const grad: number[] = new Array(x.length);
  for (let i = 0; i < x.length; i++) {
    const xp = x.slice();
    const xm = x.slice();
    xp[i] += h;
    xm[i] -= h;
    grad[i] = (fn(xp) - fn(xm)) / (2 * h);
  }
  return grad;
}

export function numericalDerivative(fn: (x: number) => number, x: number, h = 1e-5): number {
  return (fn(x + h) - fn(x - h)) / (2 * h);
}

export function numericalSecondDerivative(fn: (x: number) => number, x: number, h = 1e-5): number {
  return (fn(x + h) - 2 * fn(x) + fn(x - h)) / (h * h);
}

// ──────────────────────────────────────────────────────────────────────────────
// Gradient Descent
// ──────────────────────────────────────────────────────────────────────────────

export function gradientDescent(
  fn: ObjectiveFn,
  initialX: number[],
  options?: {
    learningRate?: number;
    maxIterations?: number;
    tolerance?: number;
    momentum?: number;
  }
): OptimizationResult {
  const lr = options?.learningRate ?? 0.01;
  const maxIter = options?.maxIterations ?? 1000;
  const tol = options?.tolerance ?? 1e-6;
  const mu = options?.momentum ?? 0;

  let x = initialX.slice();
  let velocity: number[] = new Array(x.length).fill(0);
  let iterations = 0;
  let converged = false;

  for (let iter = 0; iter < maxIter; iter++) {
    iterations++;
    const grad = numericalGradient(fn, x);

    let gradNorm = 0;
    for (let i = 0; i < grad.length; i++) {
      gradNorm += grad[i] * grad[i];
    }
    gradNorm = Math.sqrt(gradNorm);

    if (gradNorm < tol) {
      converged = true;
      break;
    }

    const xNew = x.slice();
    for (let i = 0; i < x.length; i++) {
      velocity[i] = mu * velocity[i] - lr * grad[i];
      xNew[i] = x[i] + velocity[i];
    }
    x = xNew;
  }

  return { x, value: fn(x), iterations, converged };
}

// ──────────────────────────────────────────────────────────────────────────────
// Adam Optimizer
// ──────────────────────────────────────────────────────────────────────────────

export function adam(
  fn: ObjectiveFn,
  initialX: number[],
  options?: {
    learningRate?: number;
    beta1?: number;
    beta2?: number;
    epsilon?: number;
    maxIterations?: number;
    tolerance?: number;
  }
): OptimizationResult {
  const lr = options?.learningRate ?? 0.001;
  const beta1 = options?.beta1 ?? 0.9;
  const beta2 = options?.beta2 ?? 0.999;
  const eps = options?.epsilon ?? 1e-8;
  const maxIter = options?.maxIterations ?? 1000;
  const tol = options?.tolerance ?? 1e-6;

  let x = initialX.slice();
  const m: number[] = new Array(x.length).fill(0);
  const v: number[] = new Array(x.length).fill(0);
  let iterations = 0;
  let converged = false;

  for (let t = 1; t <= maxIter; t++) {
    iterations++;
    const grad = numericalGradient(fn, x);

    let gradNorm = 0;
    for (let i = 0; i < grad.length; i++) {
      gradNorm += grad[i] * grad[i];
    }
    gradNorm = Math.sqrt(gradNorm);

    if (gradNorm < tol) {
      converged = true;
      break;
    }

    const xNew = x.slice();
    for (let i = 0; i < x.length; i++) {
      m[i] = beta1 * m[i] + (1 - beta1) * grad[i];
      v[i] = beta2 * v[i] + (1 - beta2) * grad[i] * grad[i];
      const mHat = m[i] / (1 - Math.pow(beta1, t));
      const vHat = v[i] / (1 - Math.pow(beta2, t));
      xNew[i] = x[i] - lr * mHat / (Math.sqrt(vHat) + eps);
    }
    x = xNew;
  }

  return { x, value: fn(x), iterations, converged };
}

// ──────────────────────────────────────────────────────────────────────────────
// Simulated Annealing
// ──────────────────────────────────────────────────────────────────────────────

export function simulatedAnnealing(
  fn: ObjectiveFn,
  initialX: number[],
  options?: {
    initialTemperature?: number;
    coolingRate?: number;
    minTemperature?: number;
    perturbation?: number;
    maxIterations?: number;
    random?: () => number;
  }
): OptimizationResult {
  const T0 = options?.initialTemperature ?? 100;
  const cooling = options?.coolingRate ?? 0.95;
  const Tmin = options?.minTemperature ?? 1e-6;
  const perturb = options?.perturbation ?? 0.1;
  const maxIter = options?.maxIterations ?? 10000;
  const rng = options?.random ?? Math.random;

  let x = initialX.slice();
  let bestX = x.slice();
  let currentVal = fn(x);
  let bestVal = currentVal;
  let T = T0;
  let iterations = 0;

  while (T > Tmin && iterations < maxIter) {
    iterations++;
    const candidate = x.map(xi => xi + (rng() * 2 - 1) * perturb);
    const candidateVal = fn(candidate);
    const delta = candidateVal - currentVal;

    if (delta < 0 || rng() < Math.exp(-delta / T)) {
      x = candidate;
      currentVal = candidateVal;
      if (currentVal < bestVal) {
        bestVal = currentVal;
        bestX = x.slice();
      }
    }

    T *= cooling;
  }

  return { x: bestX, value: bestVal, iterations, converged: T <= Tmin };
}

// ──────────────────────────────────────────────────────────────────────────────
// Nelder-Mead Simplex
// ──────────────────────────────────────────────────────────────────────────────

export function nelderMead(
  fn: ObjectiveFn,
  initialX: number[],
  options?: {
    maxIterations?: number;
    tolerance?: number;
    alpha?: number;
    gamma?: number;
    rho?: number;
    sigma?: number;
  }
): OptimizationResult {
  const maxIter = options?.maxIterations ?? 5000;
  const tol = options?.tolerance ?? 1e-6;
  const alpha = options?.alpha ?? 1;
  const gamma = options?.gamma ?? 2;
  const rho = options?.rho ?? 0.5;
  const sigma = options?.sigma ?? 0.5;
  const n = initialX.length;

  // Build initial simplex
  const simplex: number[][] = [initialX.slice()];
  for (let i = 0; i < n; i++) {
    const vertex = initialX.slice();
    vertex[i] += vertex[i] !== 0 ? 0.05 * vertex[i] : 0.00025;
    simplex.push(vertex);
  }

  const vals: number[] = simplex.map(v => fn(v));
  let iterations = 0;
  let converged = false;

  const order = () => {
    const idx = simplex.map((_, i) => i).sort((a, b) => vals[a] - vals[b]);
    const sCopy = idx.map(i => simplex[i].slice());
    const vCopy = idx.map(i => vals[i]);
    for (let i = 0; i <= n; i++) {
      simplex[i] = sCopy[i];
      vals[i] = vCopy[i];
    }
  };

  for (let iter = 0; iter < maxIter; iter++) {
    iterations++;
    order();

    // Convergence check
    let spread = 0;
    for (let i = 1; i <= n; i++) {
      spread += Math.abs(vals[i] - vals[0]);
    }
    if (spread / (n + 1) < tol) {
      converged = true;
      break;
    }

    // Centroid of all but worst
    const centroid: number[] = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        centroid[j] += simplex[i][j] / n;
      }
    }

    // Reflection
    const xr = centroid.map((c, j) => c + alpha * (c - simplex[n][j]));
    const vr = fn(xr);

    if (vr < vals[0]) {
      // Expansion
      const xe = centroid.map((c, j) => c + gamma * (xr[j] - c));
      const ve = fn(xe);
      if (ve < vr) {
        simplex[n] = xe;
        vals[n] = ve;
      } else {
        simplex[n] = xr;
        vals[n] = vr;
      }
    } else if (vr < vals[n - 1]) {
      simplex[n] = xr;
      vals[n] = vr;
    } else {
      // Contraction
      if (vr < vals[n]) {
        // Outside contraction
        const xc = centroid.map((c, j) => c + rho * (xr[j] - c));
        const vc = fn(xc);
        if (vc <= vr) {
          simplex[n] = xc;
          vals[n] = vc;
        } else {
          // Shrink
          for (let i = 1; i <= n; i++) {
            simplex[i] = simplex[0].map((b, j) => b + sigma * (simplex[i][j] - b));
            vals[i] = fn(simplex[i]);
          }
        }
      } else {
        // Inside contraction
        const xc = centroid.map((c, j) => c + rho * (simplex[n][j] - c));
        const vc = fn(xc);
        if (vc < vals[n]) {
          simplex[n] = xc;
          vals[n] = vc;
        } else {
          // Shrink
          for (let i = 1; i <= n; i++) {
            simplex[i] = simplex[0].map((b, j) => b + sigma * (simplex[i][j] - b));
            vals[i] = fn(simplex[i]);
          }
        }
      }
    }
  }

  order();
  return { x: simplex[0], value: vals[0], iterations, converged };
}

// ──────────────────────────────────────────────────────────────────────────────
// Bisection (1D root finding)
// ──────────────────────────────────────────────────────────────────────────────

export function bisection(
  fn: (x: number) => number,
  a: number,
  b: number,
  tolerance = 1e-10,
  maxIterations = 1000
): { root: number; iterations: number; converged: boolean } {
  let lo = a;
  let hi = b;
  let iterations = 0;
  let converged = false;

  if (fn(lo) * fn(hi) > 0) {
    // No sign change: return midpoint
    return { root: (lo + hi) / 2, iterations: 0, converged: false };
  }

  while (iterations < maxIterations) {
    iterations++;
    const mid = (lo + hi) / 2;
    const fMid = fn(mid);

    if (Math.abs(fMid) < tolerance || (hi - lo) / 2 < tolerance) {
      converged = true;
      return { root: mid, iterations, converged };
    }

    if (fn(lo) * fMid < 0) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return { root: (lo + hi) / 2, iterations, converged };
}

// ──────────────────────────────────────────────────────────────────────────────
// Newton-Raphson (1D root finding)
// ──────────────────────────────────────────────────────────────────────────────

export function newtonRaphson(
  fn: (x: number) => number,
  dfn: (x: number) => number,
  initialX: number,
  tolerance = 1e-10,
  maxIterations = 1000
): { root: number; iterations: number; converged: boolean } {
  let x = initialX;
  let iterations = 0;
  let converged = false;

  for (let iter = 0; iter < maxIterations; iter++) {
    iterations++;
    const fx = fn(x);
    if (Math.abs(fx) < tolerance) {
      converged = true;
      break;
    }
    const dfx = dfn(x);
    if (Math.abs(dfx) < 1e-14) {
      break; // derivative near zero
    }
    x = x - fx / dfx;
  }

  return { root: x, iterations, converged };
}

// ──────────────────────────────────────────────────────────────────────────────
// Golden Section Search (1D minimization)
// ──────────────────────────────────────────────────────────────────────────────

export function goldenSection(
  fn: (x: number) => number,
  a: number,
  b: number,
  tolerance = 1e-10,
  maxIterations = 1000
): { x: number; value: number; iterations: number } {
  const phi = (Math.sqrt(5) - 1) / 2; // golden ratio conjugate
  let lo = a;
  let hi = b;
  let c = hi - phi * (hi - lo);
  let d = lo + phi * (hi - lo);
  let fc = fn(c);
  let fd = fn(d);
  let iterations = 0;

  while (Math.abs(hi - lo) > tolerance && iterations < maxIterations) {
    iterations++;
    if (fc < fd) {
      hi = d;
      d = c;
      fd = fc;
      c = hi - phi * (hi - lo);
      fc = fn(c);
    } else {
      lo = c;
      c = d;
      fc = fd;
      d = lo + phi * (hi - lo);
      fd = fn(d);
    }
  }

  const xBest = (lo + hi) / 2;
  return { x: xBest, value: fn(xBest), iterations };
}

// ──────────────────────────────────────────────────────────────────────────────
// Genetic Algorithm
// ──────────────────────────────────────────────────────────────────────────────

export function geneticAlgorithm(
  fn: ObjectiveFn,
  geneCount: number,
  options?: {
    populationSize?: number;
    generations?: number;
    mutationRate?: number;
    crossoverRate?: number;
    geneMin?: number;
    geneMax?: number;
    elitism?: number;
    random?: () => number;
  }
): OptimizationResult {
  const popSize = options?.populationSize ?? 50;
  const generations = options?.generations ?? 100;
  const mutationRate = options?.mutationRate ?? 0.01;
  const crossoverRate = options?.crossoverRate ?? 0.7;
  const geneMin = options?.geneMin ?? -10;
  const geneMax = options?.geneMax ?? 10;
  const elitism = options?.elitism ?? 2;
  const rng = options?.random ?? Math.random;

  const range = geneMax - geneMin;

  // Initialize population
  let population: Individual[] = [];
  for (let i = 0; i < popSize; i++) {
    const genes = Array.from({ length: geneCount }, () => geneMin + rng() * range);
    population.push({ genes, fitness: fn(genes) });
  }

  // Sort by fitness ascending (minimization)
  const sortPop = (pop: Individual[]) => pop.sort((a, b) => a.fitness - b.fitness);

  sortPop(population);
  let bestIndividual = { genes: population[0].genes.slice(), fitness: population[0].fitness };

  // Tournament selection
  const select = (pop: Individual[]): Individual => {
    const a = Math.floor(rng() * pop.length);
    const b = Math.floor(rng() * pop.length);
    return pop[a].fitness < pop[b].fitness ? pop[a] : pop[b];
  };

  let iterations = 0;

  for (let gen = 0; gen < generations; gen++) {
    iterations++;
    const newPop: Individual[] = [];

    // Elitism: carry over best individuals
    for (let e = 0; e < elitism && e < popSize; e++) {
      newPop.push({ genes: population[e].genes.slice(), fitness: population[e].fitness });
    }

    while (newPop.length < popSize) {
      const parentA = select(population);
      const parentB = select(population);

      let childGenes: number[];
      if (rng() < crossoverRate) {
        // Single-point crossover
        const point = Math.floor(rng() * geneCount);
        childGenes = [
          ...parentA.genes.slice(0, point),
          ...parentB.genes.slice(point),
        ];
      } else {
        childGenes = parentA.genes.slice();
      }

      // Mutation
      for (let j = 0; j < geneCount; j++) {
        if (rng() < mutationRate) {
          childGenes[j] = geneMin + rng() * range;
        }
      }

      // Clamp to bounds
      childGenes = childGenes.map(g => Math.max(geneMin, Math.min(geneMax, g)));
      newPop.push({ genes: childGenes, fitness: fn(childGenes) });
    }

    population = newPop;
    sortPop(population);

    if (population[0].fitness < bestIndividual.fitness) {
      bestIndividual = { genes: population[0].genes.slice(), fitness: population[0].fitness };
    }
  }

  return {
    x: bestIndividual.genes,
    value: bestIndividual.fitness,
    iterations,
    converged: true,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Numerical Integration
// ──────────────────────────────────────────────────────────────────────────────

export function trapezoidalRule(fn: (x: number) => number, a: number, b: number, n: number): number {
  const h = (b - a) / n;
  let sum = (fn(a) + fn(b)) / 2;
  for (let i = 1; i < n; i++) {
    sum += fn(a + i * h);
  }
  return sum * h;
}

export function simpsonRule(fn: (x: number) => number, a: number, b: number, n: number): number {
  // n must be even
  const safeN = n % 2 === 0 ? n : n + 1;
  const h = (b - a) / safeN;
  let sum = fn(a) + fn(b);
  for (let i = 1; i < safeN; i++) {
    const coeff = i % 2 === 0 ? 2 : 4;
    sum += coeff * fn(a + i * h);
  }
  return (h / 3) * sum;
}

// 5-point Gauss-Legendre quadrature nodes and weights on [-1, 1]
const GL_NODES_5 = [
  -0.9061798459386640, -0.5384693101056831, 0.0,
   0.5384693101056831,  0.9061798459386640,
];
const GL_WEIGHTS_5 = [
  0.2369268850561891, 0.4786286704993665, 0.5688888888888889,
  0.4786286704993665, 0.2369268850561891,
];

// 3-point Gauss-Legendre
const GL_NODES_3 = [-0.7745966692414834, 0.0, 0.7745966692414834];
const GL_WEIGHTS_3 = [0.5555555555555556, 0.8888888888888888, 0.5555555555555556];

// 7-point Gauss-Legendre
const GL_NODES_7 = [
  -0.9491079123427585, -0.7415311855993945, -0.4058451513773972, 0.0,
   0.4058451513773972,  0.7415311855993945,  0.9491079123427585,
];
const GL_WEIGHTS_7 = [
  0.1294849661688697, 0.2797053914892767, 0.3818300505051189, 0.4179591836734694,
  0.3818300505051189, 0.2797053914892767, 0.1294849661688697,
];

export function gaussLegendre(
  fn: (x: number) => number,
  a: number,
  b: number,
  points = 5
): number {
  let nodes: number[];
  let weights: number[];

  if (points === 3) {
    nodes = GL_NODES_3;
    weights = GL_WEIGHTS_3;
  } else if (points === 7) {
    nodes = GL_NODES_7;
    weights = GL_WEIGHTS_7;
  } else {
    // default 5-point
    nodes = GL_NODES_5;
    weights = GL_WEIGHTS_5;
  }

  const mid = (a + b) / 2;
  const half = (b - a) / 2;
  let sum = 0;
  for (let i = 0; i < nodes.length; i++) {
    sum += weights[i] * fn(mid + half * nodes[i]);
  }
  return half * sum;
}

// ──────────────────────────────────────────────────────────────────────────────
// Constraint helpers
// ──────────────────────────────────────────────────────────────────────────────

export function boundedObjective(
  fn: ObjectiveFn,
  bounds: Array<[number, number]>,
  penalty = 1e6
): ObjectiveFn {
  return (x: number[]) => {
    let penaltySum = 0;
    for (let i = 0; i < bounds.length; i++) {
      const [lo, hi] = bounds[i];
      if (x[i] < lo) penaltySum += penalty * (lo - x[i]) * (lo - x[i]);
      if (x[i] > hi) penaltySum += penalty * (x[i] - hi) * (x[i] - hi);
    }
    return fn(x) + penaltySum;
  };
}
