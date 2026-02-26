// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

/**
 * Represents a discrete-time Markov chain with finite state space.
 */
export class MarkovChain {
  private states: Set<string> = new Set();
  /** transitions[from][to] = probability */
  private transitions: Map<string, Map<string, number>> = new Map();

  /** Register a state (idempotent). */
  addState(state: string): void {
    this.states.add(state);
    if (!this.transitions.has(state)) {
      this.transitions.set(state, new Map());
    }
  }

  /**
   * Set the transition probability from `from` to `to`.
   * States are auto-registered if not present.
   * Probabilities are stored raw; callers are responsible for row-sums = 1.
   */
  addTransition(from: string, to: string, probability: number): void {
    if (probability < 0 || probability > 1) {
      throw new RangeError(`Probability must be in [0, 1], got ${probability}`);
    }
    this.addState(from);
    this.addState(to);
    this.transitions.get(from)!.set(to, probability);
  }

  /** Return the transition probability from `from` to `to` (0 if undefined). */
  getTransitionProbability(from: string, to: string): number {
    return this.transitions.get(from)?.get(to) ?? 0;
  }

  /**
   * Sample the next state from `current` using the row's probability distribution.
   * Returns `null` if the current state has no outgoing transitions.
   */
  getNextState(current: string): string | null {
    const row = this.transitions.get(current);
    if (!row || row.size === 0) return null;
    const r = Math.random();
    let cumulative = 0;
    for (const [state, prob] of row) {
      cumulative += prob;
      if (r < cumulative) return state;
    }
    // floating-point safety: return last key
    return [...row.keys()].pop() ?? null;
  }

  /** Return a sorted array of all registered states. */
  getStates(): string[] {
    return [...this.states].sort();
  }

  /**
   * Return the full transition matrix as a 2-D array ordered by `getStates()`.
   * Entry [i][j] is P(states[i] → states[j]).
   */
  getTransitionMatrix(): number[][] {
    const stateList = this.getStates();
    return stateList.map((from) =>
      stateList.map((to) => this.getTransitionProbability(from, to))
    );
  }

  /**
   * A state is absorbing when its only outgoing transition leads back to itself
   * with probability 1 (or it has no outgoing transitions at all and was declared
   * absorbing via a self-loop).
   */
  isAbsorbing(state: string): boolean {
    const row = this.transitions.get(state);
    if (!row || row.size === 0) return false;
    const entries = [...row.entries()];
    return entries.length === 1 && entries[0][0] === state && entries[0][1] === 1;
  }

  /** Return all absorbing states. */
  getAbsorbingStates(): string[] {
    return this.getStates().filter((s) => this.isAbsorbing(s));
  }

  /**
   * Two states communicate if each is reachable from the other.
   */
  isCommunicating(a: string, b: string): boolean {
    return this.getReachableStates(a).has(b) && this.getReachableStates(b).has(a);
  }

  /** Return the set of states reachable from `start` (BFS, includes `start`). */
  getReachableStates(start: string): Set<string> {
    const visited = new Set<string>();
    const queue = [start];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      const row = this.transitions.get(current);
      if (row) {
        for (const [next, prob] of row) {
          if (prob > 0 && !visited.has(next)) queue.push(next);
        }
      }
    }
    return visited;
  }

  /**
   * Simulate `steps` transitions starting from `start`.
   * Returns the trajectory (including the starting state).
   */
  simulate(start: string, steps: number): string[] {
    const path: string[] = [start];
    let current = start;
    for (let i = 0; i < steps; i++) {
      const next = this.getNextState(current);
      if (next === null) break;
      path.push(next);
      current = next;
    }
    return path;
  }

  /**
   * Compute the stationary distribution via power iteration.
   * Assumes the chain is ergodic (irreducible + aperiodic).
   * Returns a map from state → probability.
   */
  steadyStateProbabilities(maxIterations = 10000, tolerance = 1e-10): Map<string, number> {
    const stateList = this.getStates();
    const n = stateList.length;
    if (n === 0) return new Map();

    // Initialise uniform distribution
    let dist = new Array(n).fill(1 / n);

    const matrix = this.getTransitionMatrix();

    for (let iter = 0; iter < maxIterations; iter++) {
      const next = new Array(n).fill(0);
      for (let j = 0; j < n; j++) {
        for (let i = 0; i < n; i++) {
          next[j] += dist[i] * matrix[i][j];
        }
      }
      let maxDiff = 0;
      for (let k = 0; k < n; k++) {
        maxDiff = Math.max(maxDiff, Math.abs(next[k] - dist[k]));
      }
      dist = next;
      if (maxDiff < tolerance) break;
    }

    const result = new Map<string, number>();
    for (let i = 0; i < n; i++) {
      result.set(stateList[i], dist[i]);
    }
    return result;
  }

  /**
   * Mean First Passage Time from `from` to `to`.
   * Solves the system m_i = 1 + Σ_{j≠to} P_{ij} m_j using Gaussian elimination.
   * Returns Infinity if `to` is not reachable from `from`.
   */
  mfpt(from: string, to: string): number {
    if (from === to) return 0;
    const reachable = this.getReachableStates(from);
    if (!reachable.has(to)) return Infinity;

    const stateList = this.getStates().filter((s) => reachable.has(s));
    const n = stateList.length;
    const idx = new Map(stateList.map((s, i) => [s, i]));
    const toIdx = idx.get(to)!;

    // Build augmented matrix for m_i = 1 + Σ_{j≠to} P_{ij} m_j
    // Rearranged: m_i - Σ_{j≠to} P_{ij} m_j = 1  (for i ≠ to)
    // m_to = 0
    const A: number[][] = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n + 1 }, (__, j) => (j === n ? (i === toIdx ? 0 : 1) : 0))
    );

    for (let i = 0; i < n; i++) {
      if (i === toIdx) {
        A[i][i] = 1; // m_to = 0
      } else {
        A[i][i] = 1;
        const fromState = stateList[i];
        const row = this.transitions.get(fromState);
        if (row) {
          for (const [nextState, prob] of row) {
            const j = idx.get(nextState);
            if (j !== undefined && j !== toIdx) {
              A[i][j] -= prob;
            }
          }
        }
      }
    }

    // Gaussian elimination
    for (let col = 0; col < n; col++) {
      // Find pivot
      let pivotRow = -1;
      for (let row = col; row < n; row++) {
        if (Math.abs(A[row][col]) > 1e-12) { pivotRow = row; break; }
      }
      if (pivotRow === -1) continue;
      [A[col], A[pivotRow]] = [A[pivotRow], A[col]];
      const scale = A[col][col];
      for (let j = col; j <= n; j++) A[col][j] /= scale;
      for (let row = 0; row < n; row++) {
        if (row === col) continue;
        const factor = A[row][col];
        for (let j = col; j <= n; j++) A[row][j] -= factor * A[col][j];
      }
    }

    const fromIdx = idx.get(from)!;
    return A[fromIdx][n];
  }

  /**
   * A chain is ergodic if it is irreducible (all states communicate) and
   * every state is aperiodic.
   * We approximate aperiodicity by checking self-loops or relying on the
   * irreducibility + finite state space (any finite irreducible chain is
   * ergodic if at least one state has a self-loop, or we accept the definition
   * used here: irreducible + aperiodic via self-loop check).
   */
  isErgodic(): boolean {
    if (!this.isIrreducible()) return false;
    // Check that at least one state has a positive self-loop (sufficient for aperiodicity
    // in a finite irreducible chain — makes it aperiodic globally).
    return this.getStates().some((s) => this.getTransitionProbability(s, s) > 0);
  }

  /**
   * A chain is irreducible if every state is reachable from every other state.
   */
  isIrreducible(): boolean {
    const states = this.getStates();
    if (states.length === 0) return true;
    const first = states[0];
    const reachableFromFirst = this.getReachableStates(first);
    if (reachableFromFirst.size !== states.length) return false;
    for (const s of states) {
      if (!this.getReachableStates(s).has(first)) return false;
    }
    return true;
  }
}

// ---------------------------------------------------------------------------
// Hidden Markov Model
// ---------------------------------------------------------------------------

export class HiddenMarkovModel {
  private states: string[] = [];
  private observations: string[] = [];
  /** emissions[state][observation] = probability */
  private emissions: Map<string, Map<string, number>> = new Map();
  /** transitions[from][to] = probability */
  private transitionProbs: Map<string, Map<string, number>> = new Map();
  /** Initial state distribution */
  private initialProbs: Map<string, number> = new Map();

  addState(state: string, initialProbability = 0): void {
    if (!this.states.includes(state)) {
      this.states.push(state);
    }
    this.initialProbs.set(state, initialProbability);
    if (!this.emissions.has(state)) this.emissions.set(state, new Map());
    if (!this.transitionProbs.has(state)) this.transitionProbs.set(state, new Map());
  }

  setEmission(state: string, observation: string, probability: number): void {
    if (!this.emissions.has(state)) this.emissions.set(state, new Map());
    this.emissions.get(state)!.set(observation, probability);
    if (!this.observations.includes(observation)) this.observations.push(observation);
  }

  setTransition(from: string, to: string, probability: number): void {
    if (!this.transitionProbs.has(from)) this.transitionProbs.set(from, new Map());
    this.transitionProbs.get(from)!.set(to, probability);
  }

  private emissionProb(state: string, obs: string): number {
    return this.emissions.get(state)?.get(obs) ?? 0;
  }

  private transProb(from: string, to: string): number {
    return this.transitionProbs.get(from)?.get(to) ?? 0;
  }

  /**
   * Viterbi algorithm: find the most likely hidden state sequence for `observations`.
   */
  viterbi(obs: string[]): string[] {
    const T = obs.length;
    if (T === 0) return [];
    const S = this.states;
    if (S.length === 0) return [];

    const delta: number[][] = Array.from({ length: T }, () => new Array(S.length).fill(0));
    const psi: number[][] = Array.from({ length: T }, () => new Array(S.length).fill(0));

    // Initialise
    for (let i = 0; i < S.length; i++) {
      delta[0][i] = (this.initialProbs.get(S[i]) ?? 0) * this.emissionProb(S[i], obs[0]);
      psi[0][i] = 0;
    }

    // Recursion
    for (let t = 1; t < T; t++) {
      for (let j = 0; j < S.length; j++) {
        let maxVal = -Infinity;
        let maxIdx = 0;
        for (let i = 0; i < S.length; i++) {
          const val = delta[t - 1][i] * this.transProb(S[i], S[j]);
          if (val > maxVal) { maxVal = val; maxIdx = i; }
        }
        delta[t][j] = maxVal * this.emissionProb(S[j], obs[t]);
        psi[t][j] = maxIdx;
      }
    }

    // Backtrack
    const path = new Array(T).fill('');
    let maxIdx = 0;
    let maxVal = -Infinity;
    for (let i = 0; i < S.length; i++) {
      if (delta[T - 1][i] > maxVal) { maxVal = delta[T - 1][i]; maxIdx = i; }
    }
    path[T - 1] = S[maxIdx];
    for (let t = T - 2; t >= 0; t--) {
      maxIdx = psi[t + 1][maxIdx];
      path[t] = S[maxIdx];
    }
    return path;
  }

  /**
   * Forward algorithm: compute the log-likelihood of an observation sequence.
   */
  forward(obs: string[]): number {
    const T = obs.length;
    if (T === 0) return 0;
    const S = this.states;
    if (S.length === 0) return -Infinity;

    let alpha = S.map((s) => (this.initialProbs.get(s) ?? 0) * this.emissionProb(s, obs[0]));

    for (let t = 1; t < T; t++) {
      const next = S.map((sj, j) => {
        let sum = 0;
        for (let i = 0; i < S.length; i++) {
          sum += alpha[i] * this.transProb(S[i], sj);
        }
        return sum * this.emissionProb(sj, obs[t]);
      });
      alpha = next;
    }

    const total = alpha.reduce((a, b) => a + b, 0);
    return total > 0 ? Math.log(total) : -Infinity;
  }

  /**
   * Generate a sequence of `length` observations by sampling the HMM.
   * Returns `{ states, observations }`.
   */
  generateSequence(length: number): { states: string[]; observations: string[] } {
    if (length <= 0 || this.states.length === 0) return { states: [], observations: [] };

    const sampleFrom = (probs: [string, number][]): string => {
      const r = Math.random();
      let cum = 0;
      for (const [item, p] of probs) {
        cum += p;
        if (r < cum) return item;
      }
      return probs[probs.length - 1][0];
    };

    // Sample initial state
    const initPairs: [string, number][] = this.states.map((s) => [s, this.initialProbs.get(s) ?? 0]);
    let currentState = sampleFrom(initPairs);

    const resultStates: string[] = [];
    const resultObs: string[] = [];

    for (let t = 0; t < length; t++) {
      resultStates.push(currentState);
      const emPairs: [string, number][] = [...(this.emissions.get(currentState) ?? new Map()).entries()];
      const obs = emPairs.length > 0 ? sampleFrom(emPairs) : '';
      resultObs.push(obs);
      const transPairs: [string, number][] = [...(this.transitionProbs.get(currentState) ?? new Map()).entries()];
      if (transPairs.length > 0) {
        currentState = sampleFrom(transPairs);
      }
    }

    return { states: resultStates, observations: resultObs };
  }
}

// ---------------------------------------------------------------------------
// N-gram Language Model
// ---------------------------------------------------------------------------

export class NgramModel {
  private n: number;
  /** counts[context_key][nextToken] = count */
  private counts: Map<string, Map<string, number>> = new Map();
  private totalTokens = 0;
  private vocabulary: Set<string> = new Set();

  constructor(n: number) {
    if (n < 1) throw new RangeError('n must be >= 1');
    this.n = n;
  }

  private contextKey(tokens: string[]): string {
    return tokens.join('\x00');
  }

  /**
   * Train the model on a token sequence.
   * For n=1 (unigram), context is the empty string.
   */
  train(tokens: string[]): void {
    for (const tok of tokens) this.vocabulary.add(tok);
    this.totalTokens += tokens.length;

    for (let i = 0; i < tokens.length; i++) {
      const contextTokens = tokens.slice(Math.max(0, i - (this.n - 1)), i);
      // Pad context if shorter than n-1
      while (contextTokens.length < this.n - 1) contextTokens.unshift('<s>');
      const key = this.contextKey(contextTokens);
      const next = tokens[i];
      if (!this.counts.has(key)) this.counts.set(key, new Map());
      const map = this.counts.get(key)!;
      map.set(next, (map.get(next) ?? 0) + 1);
    }
  }

  /**
   * Predict the most likely next token given the last `n-1` context tokens.
   * Returns `null` if context is unseen.
   */
  predict(context: string[]): string | null {
    const paddedCtx = context.slice(-(this.n - 1));
    while (paddedCtx.length < this.n - 1) paddedCtx.unshift('<s>');
    const key = this.contextKey(paddedCtx);
    const map = this.counts.get(key);
    if (!map || map.size === 0) return null;
    let best = '';
    let bestCount = -1;
    for (const [token, count] of map) {
      if (count > bestCount) { bestCount = count; best = token; }
    }
    return best;
  }

  /**
   * Return the (smoothed) probability of `next` given `context`.
   * Uses add-1 (Laplace) smoothing.
   */
  getProbability(context: string[], next: string): number {
    const paddedCtx = context.slice(-(this.n - 1));
    while (paddedCtx.length < this.n - 1) paddedCtx.unshift('<s>');
    const key = this.contextKey(paddedCtx);
    const map = this.counts.get(key);
    const count = map?.get(next) ?? 0;
    const contextTotal = map ? [...map.values()].reduce((a, b) => a + b, 0) : 0;
    const V = this.vocabulary.size || 1;
    return (count + 1) / (contextTotal + V);
  }

  /**
   * Generate `length` tokens by sampling the n-gram model.
   */
  generate(length: number, seed: string[] = []): string[] {
    if (length <= 0) return [];
    const vocabArr = [...this.vocabulary];
    if (vocabArr.length === 0) return [];

    const result: string[] = [...seed];
    for (let i = 0; i < length; i++) {
      const ctx = result.slice(-(this.n - 1));
      while (ctx.length < this.n - 1) ctx.unshift('<s>');
      const key = this.contextKey(ctx);
      const map = this.counts.get(key);

      let next: string;
      if (!map || map.size === 0) {
        // Fall back to uniform random from vocabulary
        next = vocabArr[Math.floor(Math.random() * vocabArr.length)];
      } else {
        // Weighted sample
        const entries = [...map.entries()];
        const total = entries.reduce((a, [, c]) => a + c, 0);
        let r = Math.random() * total;
        next = entries[entries.length - 1][0];
        for (const [tok, cnt] of entries) {
          r -= cnt;
          if (r <= 0) { next = tok; break; }
        }
      }
      result.push(next);
    }
    return result.slice(seed.length);
  }
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Create a Markov chain where every state transitions uniformly to all other states.
 */
export function createUniformChain(states: string[]): MarkovChain {
  const chain = new MarkovChain();
  const prob = states.length > 1 ? 1 / states.length : 1;
  for (const from of states) {
    for (const to of states) {
      chain.addTransition(from, to, prob);
    }
  }
  return chain;
}

/**
 * Create a random walk on `states` where each state transitions to its
 * immediate neighbours (and itself at boundaries).
 * States are treated as a linear sequence: s[0], s[1], ..., s[n-1].
 */
export function createRandomWalk(states: string[]): MarkovChain {
  const chain = new MarkovChain();
  const n = states.length;
  if (n === 0) return chain;
  if (n === 1) {
    chain.addTransition(states[0], states[0], 1);
    return chain;
  }
  for (let i = 0; i < n; i++) {
    const from = states[i];
    if (i === 0) {
      chain.addTransition(from, states[0], 0.5);
      chain.addTransition(from, states[1], 0.5);
    } else if (i === n - 1) {
      chain.addTransition(from, states[n - 2], 0.5);
      chain.addTransition(from, states[n - 1], 0.5);
    } else {
      chain.addTransition(from, states[i - 1], 0.5);
      chain.addTransition(from, states[i + 1], 0.5);
    }
  }
  return chain;
}

/**
 * Estimate a transition matrix from a sequence of observed states.
 * Returns a `MarkovChain` built from empirical transition frequencies.
 */
export function transitionMatrixFromData(data: string[]): MarkovChain {
  const chain = new MarkovChain();
  if (data.length === 0) return chain;

  // Count transitions
  const counts = new Map<string, Map<string, number>>();
  for (let i = 0; i < data.length - 1; i++) {
    const from = data[i];
    const to = data[i + 1];
    chain.addState(from);
    chain.addState(to);
    if (!counts.has(from)) counts.set(from, new Map());
    const row = counts.get(from)!;
    row.set(to, (row.get(to) ?? 0) + 1);
  }
  // Ensure last state is registered
  chain.addState(data[data.length - 1]);

  // Normalise
  for (const [from, row] of counts) {
    const total = [...row.values()].reduce((a, b) => a + b, 0);
    for (const [to, count] of row) {
      chain.addTransition(from, to, count / total);
    }
  }
  return chain;
}
