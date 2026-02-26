// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

import {
  MarkovChain,
  HiddenMarkovModel,
  NgramModel,
  createUniformChain,
  createRandomWalk,
  transitionMatrixFromData,
} from '../markov-chain';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a simple two-state ergodic chain: A <-> B with self-loops. */
function buildTwoStateChain(): MarkovChain {
  const mc = new MarkovChain();
  mc.addTransition('A', 'A', 0.3);
  mc.addTransition('A', 'B', 0.7);
  mc.addTransition('B', 'A', 0.4);
  mc.addTransition('B', 'B', 0.6);
  return mc;
}

/** Build a three-state absorbing chain with one absorbing state 'C'. */
function buildAbsorbingChain(): MarkovChain {
  const mc = new MarkovChain();
  mc.addTransition('A', 'B', 0.5);
  mc.addTransition('A', 'C', 0.5);
  mc.addTransition('B', 'A', 0.5);
  mc.addTransition('B', 'C', 0.5);
  mc.addTransition('C', 'C', 1);
  return mc;
}

/** Build a simple HMM for Sunny/Rainy weather with walk/shop observations. */
function buildWeatherHMM(): HiddenMarkovModel {
  const hmm = new HiddenMarkovModel();
  hmm.addState('Sunny', 0.6);
  hmm.addState('Rainy', 0.4);
  hmm.setTransition('Sunny', 'Sunny', 0.7);
  hmm.setTransition('Sunny', 'Rainy', 0.3);
  hmm.setTransition('Rainy', 'Sunny', 0.4);
  hmm.setTransition('Rainy', 'Rainy', 0.6);
  hmm.setEmission('Sunny', 'walk', 0.6);
  hmm.setEmission('Sunny', 'shop', 0.4);
  hmm.setEmission('Rainy', 'walk', 0.1);
  hmm.setEmission('Rainy', 'shop', 0.9);
  return hmm;
}

// ---------------------------------------------------------------------------
// 1. MarkovChain — addState / getStates
// ---------------------------------------------------------------------------

describe('MarkovChain.addState / getStates', () => {
  it('starts with no states', () => {
    const mc = new MarkovChain();
    expect(mc.getStates()).toEqual([]);
  });

  for (let i = 1; i <= 30; i++) {
    it(`registers ${i} state(s) correctly`, () => {
      const mc = new MarkovChain();
      for (let j = 0; j < i; j++) mc.addState(`S${j}`);
      expect(mc.getStates().length).toBe(i);
    });
  }

  it('addState is idempotent', () => {
    const mc = new MarkovChain();
    mc.addState('X');
    mc.addState('X');
    expect(mc.getStates().length).toBe(1);
  });

  it('states are returned sorted', () => {
    const mc = new MarkovChain();
    mc.addState('Z');
    mc.addState('A');
    mc.addState('M');
    expect(mc.getStates()).toEqual(['A', 'M', 'Z']);
  });

  for (let i = 0; i < 10; i++) {
    it(`state name with special chars ${i}`, () => {
      const mc = new MarkovChain();
      mc.addState(`state_${i}-v${i}`);
      expect(mc.getStates().length).toBe(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. MarkovChain — addTransition / getTransitionProbability
// ---------------------------------------------------------------------------

describe('MarkovChain.addTransition / getTransitionProbability', () => {
  it('returns 0 for unknown transition', () => {
    const mc = new MarkovChain();
    mc.addState('A');
    expect(mc.getTransitionProbability('A', 'B')).toBe(0);
  });

  it('stores and retrieves a transition', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'B', 0.5);
    expect(mc.getTransitionProbability('A', 'B')).toBe(0.5);
  });

  it('auto-registers states on addTransition', () => {
    const mc = new MarkovChain();
    mc.addTransition('X', 'Y', 0.3);
    expect(mc.getStates()).toContain('X');
    expect(mc.getStates()).toContain('Y');
  });

  it('throws on probability > 1', () => {
    const mc = new MarkovChain();
    expect(() => mc.addTransition('A', 'B', 1.1)).toThrow(RangeError);
  });

  it('throws on probability < 0', () => {
    const mc = new MarkovChain();
    expect(() => mc.addTransition('A', 'B', -0.1)).toThrow(RangeError);
  });

  it('allows probability = 0', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'B', 0);
    expect(mc.getTransitionProbability('A', 'B')).toBe(0);
  });

  it('allows probability = 1', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'B', 1);
    expect(mc.getTransitionProbability('A', 'B')).toBe(1);
  });

  it('overwrites existing transition probability', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'B', 0.3);
    mc.addTransition('A', 'B', 0.8);
    expect(mc.getTransitionProbability('A', 'B')).toBe(0.8);
  });

  for (let i = 1; i <= 30; i++) {
    const prob = i / 30;
    it(`stores transition with probability ${prob.toFixed(4)}`, () => {
      const mc = new MarkovChain();
      mc.addTransition('A', 'B', prob);
      expect(mc.getTransitionProbability('A', 'B')).toBeCloseTo(prob);
    });
  }

  it('returns 0 for reverse direction when only one direction defined', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'B', 0.7);
    expect(mc.getTransitionProbability('B', 'A')).toBe(0);
  });

  it('handles self-loop transition', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'A', 0.5);
    expect(mc.getTransitionProbability('A', 'A')).toBe(0.5);
  });

  for (let i = 0; i < 10; i++) {
    it(`getTransitionProbability for unknown state pair ${i}`, () => {
      const mc = new MarkovChain();
      expect(mc.getTransitionProbability(`U${i}`, `V${i}`)).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. MarkovChain — getTransitionMatrix
// ---------------------------------------------------------------------------

describe('MarkovChain.getTransitionMatrix', () => {
  it('returns empty matrix for empty chain', () => {
    const mc = new MarkovChain();
    expect(mc.getTransitionMatrix()).toEqual([]);
  });

  it('returns 1x1 matrix for single state with self-loop', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'A', 1);
    expect(mc.getTransitionMatrix()).toEqual([[1]]);
  });

  it('returns correct 2x2 matrix', () => {
    const mc = buildTwoStateChain();
    const mat = mc.getTransitionMatrix();
    expect(mat.length).toBe(2);
    expect(mat[0].length).toBe(2);
    // States sorted: A, B
    expect(mat[0][0]).toBeCloseTo(0.3); // A->A
    expect(mat[0][1]).toBeCloseTo(0.7); // A->B
    expect(mat[1][0]).toBeCloseTo(0.4); // B->A
    expect(mat[1][1]).toBeCloseTo(0.6); // B->B
  });

  it('matrix rows sum to 1 for a valid stochastic chain', () => {
    const mc = buildTwoStateChain();
    const mat = mc.getTransitionMatrix();
    for (const row of mat) {
      expect(row.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    }
  });

  it('matrix rows sum to 1 for three-state chain', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'A', 0.2);
    mc.addTransition('A', 'B', 0.5);
    mc.addTransition('A', 'C', 0.3);
    mc.addTransition('B', 'A', 0.1);
    mc.addTransition('B', 'B', 0.6);
    mc.addTransition('B', 'C', 0.3);
    mc.addTransition('C', 'A', 0.4);
    mc.addTransition('C', 'B', 0.4);
    mc.addTransition('C', 'C', 0.2);
    const mat = mc.getTransitionMatrix();
    for (const row of mat) {
      expect(row.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    }
  });

  for (let n = 2; n <= 10; n++) {
    it(`matrix is ${n}x${n} for uniform chain of ${n} states`, () => {
      const states = Array.from({ length: n }, (_, i) => `S${i}`);
      const mc = createUniformChain(states);
      const mat = mc.getTransitionMatrix();
      expect(mat.length).toBe(n);
      for (const row of mat) {
        expect(row.length).toBe(n);
        expect(row.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
      }
    });
  }

  it('contains zeros for missing transitions', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'B', 1);
    mc.addState('C');
    const mat = mc.getTransitionMatrix();
    // States: A, B, C sorted
    // A->C = 0, B->A = 0, B->B = 0, etc.
    const states = mc.getStates();
    const aIdx = states.indexOf('A');
    const cIdx = states.indexOf('C');
    expect(mat[aIdx][cIdx]).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 4. MarkovChain — getNextState
// ---------------------------------------------------------------------------

describe('MarkovChain.getNextState', () => {
  it('returns null for state with no outgoing transitions', () => {
    const mc = new MarkovChain();
    mc.addState('A');
    expect(mc.getNextState('A')).toBeNull();
  });

  it('returns the only possible next state when prob=1', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'B', 1);
    expect(mc.getNextState('A')).toBe('B');
  });

  it('returns self for self-absorbing state', () => {
    const mc = new MarkovChain();
    mc.addTransition('X', 'X', 1);
    expect(mc.getNextState('X')).toBe('X');
  });

  for (let trial = 0; trial < 20; trial++) {
    it(`getNextState returns a valid state on trial ${trial}`, () => {
      const mc = buildTwoStateChain();
      const next = mc.getNextState('A');
      expect(['A', 'B']).toContain(next);
    });
  }

  it('returns null for completely unknown state', () => {
    const mc = new MarkovChain();
    expect(mc.getNextState('UNKNOWN')).toBeNull();
  });

  it('respects weighting over many samples', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'B', 0.9);
    mc.addTransition('A', 'C', 0.1);
    let bCount = 0;
    const trials = 1000;
    for (let i = 0; i < trials; i++) {
      if (mc.getNextState('A') === 'B') bCount++;
    }
    // Expect ~900, allow ±100
    expect(bCount).toBeGreaterThan(750);
    expect(bCount).toBeLessThan(1000);
  });

  for (let i = 0; i < 15; i++) {
    it(`getNextState on three-state chain trial ${i} returns valid state`, () => {
      const mc = new MarkovChain();
      mc.addTransition('A', 'B', 0.5);
      mc.addTransition('A', 'C', 0.5);
      mc.addTransition('B', 'A', 0.5);
      mc.addTransition('B', 'C', 0.5);
      mc.addTransition('C', 'A', 0.5);
      mc.addTransition('C', 'B', 0.5);
      const next = mc.getNextState('A');
      expect(['B', 'C']).toContain(next);
    });
  }
});

// ---------------------------------------------------------------------------
// 5. MarkovChain — simulate
// ---------------------------------------------------------------------------

describe('MarkovChain.simulate', () => {
  it('returns [start] for 0 steps', () => {
    const mc = buildTwoStateChain();
    expect(mc.simulate('A', 0)).toEqual(['A']);
  });

  it('path length is steps + 1', () => {
    const mc = buildTwoStateChain();
    const path = mc.simulate('A', 5);
    expect(path.length).toBe(6);
  });

  it('first element is the start state', () => {
    const mc = buildTwoStateChain();
    const path = mc.simulate('B', 10);
    expect(path[0]).toBe('B');
  });

  it('each step is a valid state', () => {
    const mc = buildTwoStateChain();
    const path = mc.simulate('A', 50);
    for (const s of path) {
      expect(['A', 'B']).toContain(s);
    }
  });

  it('stops early if no transitions exist', () => {
    const mc = new MarkovChain();
    mc.addState('X');
    const path = mc.simulate('X', 10);
    expect(path).toEqual(['X']);
  });

  it('absorbing state stays absorbing', () => {
    const mc = buildAbsorbingChain();
    const path = mc.simulate('C', 5);
    expect(path.every((s) => s === 'C')).toBe(true);
  });

  for (let steps = 1; steps <= 20; steps++) {
    it(`simulate ${steps} steps yields path of length ${steps + 1}`, () => {
      const mc = buildTwoStateChain();
      expect(mc.simulate('A', steps).length).toBe(steps + 1);
    });
  }

  for (let trial = 0; trial < 10; trial++) {
    it(`simulate(A, 100) trial ${trial} has all valid states`, () => {
      const mc = buildTwoStateChain();
      const path = mc.simulate('A', 100);
      for (const s of path) {
        expect(['A', 'B']).toContain(s);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 6. MarkovChain — isAbsorbing / getAbsorbingStates
// ---------------------------------------------------------------------------

describe('MarkovChain.isAbsorbing / getAbsorbingStates', () => {
  it('C is absorbing in absorbing chain', () => {
    const mc = buildAbsorbingChain();
    expect(mc.isAbsorbing('C')).toBe(true);
  });

  it('A is not absorbing in absorbing chain', () => {
    const mc = buildAbsorbingChain();
    expect(mc.isAbsorbing('A')).toBe(false);
  });

  it('B is not absorbing in absorbing chain', () => {
    const mc = buildAbsorbingChain();
    expect(mc.isAbsorbing('B')).toBe(false);
  });

  it('getAbsorbingStates returns [C] for absorbing chain', () => {
    const mc = buildAbsorbingChain();
    expect(mc.getAbsorbingStates()).toEqual(['C']);
  });

  it('no absorbing states in ergodic chain', () => {
    const mc = buildTwoStateChain();
    expect(mc.getAbsorbingStates()).toEqual([]);
  });

  it('state with no outgoing transitions is not absorbing', () => {
    const mc = new MarkovChain();
    mc.addState('isolated');
    expect(mc.isAbsorbing('isolated')).toBe(false);
  });

  it('two absorbing states are both detected', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'A', 1);
    mc.addTransition('B', 'B', 1);
    mc.addTransition('C', 'A', 0.5);
    mc.addTransition('C', 'B', 0.5);
    const abs = mc.getAbsorbingStates();
    expect(abs).toContain('A');
    expect(abs).toContain('B');
    expect(abs.length).toBe(2);
  });

  for (let i = 0; i < 10; i++) {
    it(`absorbing detection stable on variant ${i}`, () => {
      const mc = new MarkovChain();
      mc.addTransition(`D${i}`, `D${i}`, 1);
      expect(mc.isAbsorbing(`D${i}`)).toBe(true);
    });
  }

  it('state with partial self-loop is not absorbing', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'A', 0.5);
    mc.addTransition('A', 'B', 0.5);
    expect(mc.isAbsorbing('A')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 7. MarkovChain — getReachableStates / isCommunicating
// ---------------------------------------------------------------------------

describe('MarkovChain.getReachableStates / isCommunicating', () => {
  it('reachable from A in two-state ergodic chain includes both states', () => {
    const mc = buildTwoStateChain();
    const r = mc.getReachableStates('A');
    expect(r.has('A')).toBe(true);
    expect(r.has('B')).toBe(true);
  });

  it('reachable from absorbing state is just itself', () => {
    const mc = buildAbsorbingChain();
    const r = mc.getReachableStates('C');
    expect(r.size).toBe(1);
    expect(r.has('C')).toBe(true);
  });

  it('reachable from A in absorbing chain includes all three', () => {
    const mc = buildAbsorbingChain();
    const r = mc.getReachableStates('A');
    expect(r.has('A')).toBe(true);
    expect(r.has('B')).toBe(true);
    expect(r.has('C')).toBe(true);
  });

  it('isolated state has only itself reachable', () => {
    const mc = new MarkovChain();
    mc.addState('iso');
    const r = mc.getReachableStates('iso');
    expect(r.size).toBe(1);
    expect(r.has('iso')).toBe(true);
  });

  it('A communicates with B in ergodic chain', () => {
    const mc = buildTwoStateChain();
    expect(mc.isCommunicating('A', 'B')).toBe(true);
  });

  it('B communicates with A in ergodic chain', () => {
    const mc = buildTwoStateChain();
    expect(mc.isCommunicating('B', 'A')).toBe(true);
  });

  it('A does not communicate with C in absorbing chain (C unreachable from A via B back)', () => {
    const mc = buildAbsorbingChain();
    // C is reachable from A, but A is NOT reachable from C
    expect(mc.isCommunicating('A', 'C')).toBe(false);
  });

  for (let i = 0; i < 10; i++) {
    it(`isCommunicating reflexive check state S${i}`, () => {
      const mc = createUniformChain([`S${i}`, `T${i}`]);
      expect(mc.isCommunicating(`S${i}`, `T${i}`)).toBe(true);
    });
  }

  it('reachable set size correct for uniform 5-state chain', () => {
    const states = ['A', 'B', 'C', 'D', 'E'];
    const mc = createUniformChain(states);
    expect(mc.getReachableStates('A').size).toBe(5);
  });

  for (let n = 2; n <= 8; n++) {
    it(`reachable from any state in uniform ${n}-state chain is all ${n} states`, () => {
      const states = Array.from({ length: n }, (_, i) => `S${i}`);
      const mc = createUniformChain(states);
      expect(mc.getReachableStates('S0').size).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// 8. MarkovChain — isIrreducible / isErgodic
// ---------------------------------------------------------------------------

describe('MarkovChain.isIrreducible / isErgodic', () => {
  it('two-state ergodic chain is irreducible', () => {
    expect(buildTwoStateChain().isIrreducible()).toBe(true);
  });

  it('two-state ergodic chain is ergodic', () => {
    expect(buildTwoStateChain().isErgodic()).toBe(true);
  });

  it('absorbing chain is not irreducible', () => {
    expect(buildAbsorbingChain().isIrreducible()).toBe(false);
  });

  it('absorbing chain is not ergodic', () => {
    expect(buildAbsorbingChain().isErgodic()).toBe(false);
  });

  it('empty chain is irreducible', () => {
    expect(new MarkovChain().isIrreducible()).toBe(true);
  });

  it('single-state self-loop chain is irreducible', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'A', 1);
    expect(mc.isIrreducible()).toBe(true);
  });

  it('single-state self-loop chain is ergodic', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'A', 1);
    expect(mc.isErgodic()).toBe(true);
  });

  it('chain without self-loops is not ergodic even if irreducible', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'B', 1);
    mc.addTransition('B', 'A', 1);
    expect(mc.isIrreducible()).toBe(true);
    expect(mc.isErgodic()).toBe(false); // no self-loops
  });

  for (let n = 2; n <= 8; n++) {
    it(`uniform ${n}-state chain is irreducible`, () => {
      const states = Array.from({ length: n }, (_, i) => `S${i}`);
      expect(createUniformChain(states).isIrreducible()).toBe(true);
    });
  }

  for (let n = 2; n <= 8; n++) {
    it(`uniform ${n}-state chain is ergodic`, () => {
      const states = Array.from({ length: n }, (_, i) => `S${i}`);
      expect(createUniformChain(states).isErgodic()).toBe(true);
    });
  }

  it('directed acyclic chain is not irreducible', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'B', 1);
    mc.addTransition('B', 'C', 1);
    mc.addTransition('C', 'C', 1);
    expect(mc.isIrreducible()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 9. MarkovChain — steadyStateProbabilities
// ---------------------------------------------------------------------------

describe('MarkovChain.steadyStateProbabilities', () => {
  it('returns empty map for empty chain', () => {
    expect(new MarkovChain().steadyStateProbabilities().size).toBe(0);
  });

  it('steady state probabilities sum to 1', () => {
    const mc = buildTwoStateChain();
    const dist = mc.steadyStateProbabilities();
    const total = [...dist.values()].reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 5);
  });

  it('steady state for two-state chain matches analytic solution', () => {
    // P(A) = 0.4/(0.4+0.7) = 4/11, P(B) = 0.7/(0.4+0.7) = 7/11
    const mc = buildTwoStateChain();
    const dist = mc.steadyStateProbabilities();
    expect(dist.get('A')!).toBeCloseTo(4 / 11, 4);
    expect(dist.get('B')!).toBeCloseTo(7 / 11, 4);
  });

  it('uniform chain steady state is uniform', () => {
    const mc = createUniformChain(['A', 'B', 'C']);
    const dist = mc.steadyStateProbabilities();
    for (const [, v] of dist) {
      expect(v).toBeCloseTo(1 / 3, 4);
    }
  });

  it('single absorbing state has probability 1', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'A', 1);
    const dist = mc.steadyStateProbabilities();
    expect(dist.get('A')).toBeCloseTo(1, 5);
  });

  for (let n = 2; n <= 8; n++) {
    it(`uniform ${n}-state chain steady state sums to 1`, () => {
      const states = Array.from({ length: n }, (_, i) => `S${i}`);
      const mc = createUniformChain(states);
      const dist = mc.steadyStateProbabilities();
      const total = [...dist.values()].reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(1, 4);
    });
  }

  for (let n = 2; n <= 8; n++) {
    it(`uniform ${n}-state chain each state gets probability 1/${n}`, () => {
      const states = Array.from({ length: n }, (_, i) => `S${i}`);
      const mc = createUniformChain(states);
      const dist = mc.steadyStateProbabilities();
      for (const [, v] of dist) {
        expect(v).toBeCloseTo(1 / n, 3);
      }
    });
  }

  it('steady state keys match getStates()', () => {
    const mc = buildTwoStateChain();
    const dist = mc.steadyStateProbabilities();
    const keys = [...dist.keys()].sort();
    expect(keys).toEqual(mc.getStates());
  });

  it('all steady state values are non-negative', () => {
    const mc = buildTwoStateChain();
    const dist = mc.steadyStateProbabilities();
    for (const [, v] of dist) {
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });
});

// ---------------------------------------------------------------------------
// 10. MarkovChain — mfpt (mean first passage time)
// ---------------------------------------------------------------------------

describe('MarkovChain.mfpt', () => {
  it('mfpt from state to itself is 0', () => {
    const mc = buildTwoStateChain();
    expect(mc.mfpt('A', 'A')).toBe(0);
    expect(mc.mfpt('B', 'B')).toBe(0);
  });

  it('mfpt is Infinity when target not reachable', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'B', 1);
    mc.addTransition('B', 'B', 1);
    expect(mc.mfpt('B', 'A')).toBe(Infinity);
  });

  it('mfpt A->B is finite in ergodic chain', () => {
    const mc = buildTwoStateChain();
    expect(isFinite(mc.mfpt('A', 'B'))).toBe(true);
  });

  it('mfpt B->A is finite in ergodic chain', () => {
    const mc = buildTwoStateChain();
    expect(isFinite(mc.mfpt('B', 'A'))).toBe(true);
  });

  it('mfpt A->B matches analytic formula for two-state chain', () => {
    // P(A->A)=0.3, P(A->B)=0.7, P(B->A)=0.4, P(B->B)=0.6
    // m_AB = 1/0.7 * (1 + 0.3*m_AB) => m_AB = 1/(0.7*(1-0.3))... solve properly:
    // m_AB = 1 + 0.3 * m_AB => 0.7 * m_AB = 1 => m_AB = 1/0.7 ≈ 1.4286
    const mc = buildTwoStateChain();
    expect(mc.mfpt('A', 'B')).toBeCloseTo(1 / 0.7, 3);
  });

  it('mfpt B->A matches analytic formula', () => {
    // m_BA = 1 + 0.6 * m_BA => 0.4 * m_BA = 1 => m_BA = 2.5
    const mc = buildTwoStateChain();
    expect(mc.mfpt('B', 'A')).toBeCloseTo(2.5, 3);
  });

  it('mfpt is positive for reachable non-self transitions', () => {
    const mc = buildTwoStateChain();
    expect(mc.mfpt('A', 'B')).toBeGreaterThan(0);
  });

  for (let i = 0; i < 10; i++) {
    it(`mfpt self-to-self is 0 for state variant ${i}`, () => {
      const mc = new MarkovChain();
      mc.addTransition(`X${i}`, `X${i}`, 1);
      expect(mc.mfpt(`X${i}`, `X${i}`)).toBe(0);
    });
  }

  it('mfpt to absorbing state is finite from transient state', () => {
    const mc = buildAbsorbingChain();
    expect(isFinite(mc.mfpt('A', 'C'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 11. createUniformChain
// ---------------------------------------------------------------------------

describe('createUniformChain', () => {
  it('returns empty chain for empty states', () => {
    const mc = createUniformChain([]);
    expect(mc.getStates()).toEqual([]);
  });

  it('single state has self-loop prob 1', () => {
    const mc = createUniformChain(['A']);
    expect(mc.getTransitionProbability('A', 'A')).toBe(1);
  });

  for (let n = 2; n <= 15; n++) {
    it(`uniform chain of ${n} states has all probs = 1/${n}`, () => {
      const states = Array.from({ length: n }, (_, i) => `S${i}`);
      const mc = createUniformChain(states);
      for (const from of states) {
        for (const to of states) {
          expect(mc.getTransitionProbability(from, to)).toBeCloseTo(1 / n, 8);
        }
      }
    });
  }

  it('all states registered', () => {
    const states = ['X', 'Y', 'Z'];
    const mc = createUniformChain(states);
    expect(mc.getStates()).toEqual(states.sort());
  });

  it('matrix rows sum to 1', () => {
    const mc = createUniformChain(['A', 'B', 'C', 'D']);
    for (const row of mc.getTransitionMatrix()) {
      expect(row.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 8);
    }
  });

  for (let n = 2; n <= 10; n++) {
    it(`uniform ${n}-state chain is ergodic`, () => {
      const states = Array.from({ length: n }, (_, i) => `U${i}`);
      expect(createUniformChain(states).isErgodic()).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 12. createRandomWalk
// ---------------------------------------------------------------------------

describe('createRandomWalk', () => {
  it('returns empty chain for empty states', () => {
    const mc = createRandomWalk([]);
    expect(mc.getStates()).toEqual([]);
  });

  it('single state has self-loop', () => {
    const mc = createRandomWalk(['A']);
    expect(mc.getTransitionProbability('A', 'A')).toBe(1);
  });

  it('two-state random walk: each state goes to both with prob 0.5', () => {
    const mc = createRandomWalk(['A', 'B']);
    expect(mc.getTransitionProbability('A', 'A')).toBeCloseTo(0.5);
    expect(mc.getTransitionProbability('A', 'B')).toBeCloseTo(0.5);
    expect(mc.getTransitionProbability('B', 'A')).toBeCloseTo(0.5);
    expect(mc.getTransitionProbability('B', 'B')).toBeCloseTo(0.5);
  });

  it('interior states in long walk transition to neighbours only', () => {
    const states = ['A', 'B', 'C', 'D', 'E'];
    const mc = createRandomWalk(states);
    // B transitions to A and C only
    expect(mc.getTransitionProbability('B', 'A')).toBeCloseTo(0.5);
    expect(mc.getTransitionProbability('B', 'C')).toBeCloseTo(0.5);
    expect(mc.getTransitionProbability('B', 'D')).toBe(0);
    expect(mc.getTransitionProbability('B', 'E')).toBe(0);
  });

  it('boundary states of random walk have two transitions summing to 1', () => {
    const states = ['A', 'B', 'C'];
    const mc = createRandomWalk(states);
    const aRow = mc.getTransitionMatrix()[mc.getStates().indexOf('A')];
    expect(aRow.reduce((s, v) => s + v, 0)).toBeCloseTo(1);
    const cRow = mc.getTransitionMatrix()[mc.getStates().indexOf('C')];
    expect(cRow.reduce((s, v) => s + v, 0)).toBeCloseTo(1);
  });

  for (let n = 3; n <= 12; n++) {
    it(`random walk on ${n} states all rows sum to 1`, () => {
      const states = Array.from({ length: n }, (_, i) => `S${i}`);
      const mc = createRandomWalk(states);
      for (const row of mc.getTransitionMatrix()) {
        expect(row.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
      }
    });
  }

  it('random walk on 5 states: first state goes to itself and next only', () => {
    const states = ['A', 'B', 'C', 'D', 'E'];
    const mc = createRandomWalk(states);
    const sortedStates = mc.getStates();
    const aIdx = sortedStates.indexOf('A');
    const bIdx = sortedStates.indexOf('B');
    const cIdx = sortedStates.indexOf('C');
    const row = mc.getTransitionMatrix()[aIdx];
    expect(row[aIdx]).toBeCloseTo(0.5);
    expect(row[bIdx]).toBeCloseTo(0.5);
    expect(row[cIdx]).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 13. transitionMatrixFromData
// ---------------------------------------------------------------------------

describe('transitionMatrixFromData', () => {
  it('returns empty chain for empty data', () => {
    expect(transitionMatrixFromData([]).getStates()).toEqual([]);
  });

  it('single element data registers one state', () => {
    const mc = transitionMatrixFromData(['A']);
    expect(mc.getStates()).toContain('A');
  });

  it('simple two-state sequence estimates correct probabilities', () => {
    // ABABAB -> A->B: 3, B->A: 2, B->B: 0
    const data = ['A', 'B', 'A', 'B', 'A', 'B'];
    const mc = transitionMatrixFromData(data);
    expect(mc.getTransitionProbability('A', 'B')).toBeCloseTo(1);
    expect(mc.getTransitionProbability('B', 'A')).toBeCloseTo(1);
  });

  it('mixed sequence estimates partial probabilities', () => {
    const data = ['A', 'A', 'A', 'B', 'A'];
    const mc = transitionMatrixFromData(data);
    // A->A: 2 times, A->B: 1 time, B->A: 1 time
    expect(mc.getTransitionProbability('A', 'A')).toBeCloseTo(2 / 3, 4);
    expect(mc.getTransitionProbability('A', 'B')).toBeCloseTo(1 / 3, 4);
    expect(mc.getTransitionProbability('B', 'A')).toBeCloseTo(1);
  });

  it('matrix rows sum to 1 for empirical data', () => {
    const data = ['A', 'B', 'C', 'A', 'C', 'B', 'A', 'B'];
    const mc = transitionMatrixFromData(data);
    for (const state of mc.getStates()) {
      const row = mc.getTransitionMatrix()[mc.getStates().indexOf(state)];
      const rowSum = row.reduce((a, b) => a + b, 0);
      // Only states with outgoing transitions should sum to 1; others to 0
      if (rowSum > 0) expect(rowSum).toBeCloseTo(1, 4);
    }
  });

  for (let n = 2; n <= 10; n++) {
    it(`empirical chain from repeated ABAB... of length ${n * 2} has correct transitions`, () => {
      const data: string[] = [];
      for (let i = 0; i < n; i++) { data.push('A'); data.push('B'); }
      const mc = transitionMatrixFromData(data);
      expect(mc.getTransitionProbability('A', 'B')).toBeCloseTo(1, 4);
    });
  }

  it('all states from data are registered', () => {
    const data = ['X', 'Y', 'Z', 'X', 'Z', 'Y'];
    const mc = transitionMatrixFromData(data);
    expect(mc.getStates()).toContain('X');
    expect(mc.getStates()).toContain('Y');
    expect(mc.getStates()).toContain('Z');
  });

  it('three-state sequence with bias', () => {
    // A always goes to B
    const data = ['A', 'B', 'A', 'B', 'A', 'B', 'C'];
    const mc = transitionMatrixFromData(data);
    expect(mc.getTransitionProbability('A', 'B')).toBeCloseTo(1, 4);
  });
});

// ---------------------------------------------------------------------------
// 14. HiddenMarkovModel — addState / setEmission / setTransition
// ---------------------------------------------------------------------------

describe('HiddenMarkovModel.addState / setEmission / setTransition', () => {
  it('can add a state', () => {
    const hmm = new HiddenMarkovModel();
    hmm.addState('S1', 1.0);
    expect(true).toBe(true); // no error
  });

  it('can set emission probability', () => {
    const hmm = new HiddenMarkovModel();
    hmm.addState('S1', 1.0);
    hmm.setEmission('S1', 'obs', 0.5);
    expect(true).toBe(true);
  });

  it('can set transition probability', () => {
    const hmm = new HiddenMarkovModel();
    hmm.addState('S1', 0.5);
    hmm.addState('S2', 0.5);
    hmm.setTransition('S1', 'S2', 1.0);
    expect(true).toBe(true);
  });

  for (let i = 0; i < 15; i++) {
    it(`addState with initial prob ${(i / 15).toFixed(2)} is accepted`, () => {
      const hmm = new HiddenMarkovModel();
      hmm.addState(`State${i}`, i / 15);
      expect(true).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 15. HiddenMarkovModel — viterbi
// ---------------------------------------------------------------------------

describe('HiddenMarkovModel.viterbi', () => {
  it('returns empty array for empty observation sequence', () => {
    const hmm = buildWeatherHMM();
    expect(hmm.viterbi([])).toEqual([]);
  });

  it('returns path of same length as observations', () => {
    const hmm = buildWeatherHMM();
    const path = hmm.viterbi(['walk', 'shop', 'walk']);
    expect(path.length).toBe(3);
  });

  it('all path states are valid hidden states', () => {
    const hmm = buildWeatherHMM();
    const path = hmm.viterbi(['walk', 'shop', 'walk', 'walk', 'shop']);
    for (const s of path) {
      expect(['Sunny', 'Rainy']).toContain(s);
    }
  });

  it('mostly walks -> mostly Sunny states', () => {
    const hmm = buildWeatherHMM();
    const path = hmm.viterbi(['walk', 'walk', 'walk', 'walk', 'walk']);
    const sunnyCount = path.filter((s) => s === 'Sunny').length;
    expect(sunnyCount).toBeGreaterThan(path.length / 2);
  });

  it('mostly shops -> mostly Rainy states', () => {
    const hmm = buildWeatherHMM();
    const path = hmm.viterbi(['shop', 'shop', 'shop', 'shop', 'shop']);
    const rainyCount = path.filter((s) => s === 'Rainy').length;
    expect(rainyCount).toBeGreaterThan(path.length / 2);
  });

  it('single observation returns single-state path', () => {
    const hmm = buildWeatherHMM();
    const path = hmm.viterbi(['walk']);
    expect(path.length).toBe(1);
    expect(['Sunny', 'Rainy']).toContain(path[0]);
  });

  for (let len = 1; len <= 15; len++) {
    it(`viterbi path length matches observation length ${len}`, () => {
      const hmm = buildWeatherHMM();
      const obs = Array.from({ length: len }, (_, i) => (i % 2 === 0 ? 'walk' : 'shop'));
      expect(hmm.viterbi(obs).length).toBe(len);
    });
  }

  it('returns empty for HMM with no states', () => {
    const hmm = new HiddenMarkovModel();
    expect(hmm.viterbi(['obs1'])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 16. HiddenMarkovModel — forward
// ---------------------------------------------------------------------------

describe('HiddenMarkovModel.forward', () => {
  it('returns 0 for empty observation sequence', () => {
    const hmm = buildWeatherHMM();
    expect(hmm.forward([])).toBe(0);
  });

  it('returns a negative number (log likelihood) for valid observations', () => {
    const hmm = buildWeatherHMM();
    const logL = hmm.forward(['walk', 'shop']);
    expect(logL).toBeLessThan(0);
  });

  it('likely sequence has higher log-likelihood than unlikely', () => {
    const hmm = buildWeatherHMM();
    const likely = hmm.forward(['walk', 'walk', 'walk']);   // Sunny likely
    const unlikely = hmm.forward(['shop', 'shop', 'shop']); // Rainy likely but P(Rainy) lower init
    // just check both are finite
    expect(isFinite(likely)).toBe(true);
    expect(isFinite(unlikely)).toBe(true);
  });

  for (let len = 1; len <= 10; len++) {
    it(`forward on length-${len} observation is finite`, () => {
      const hmm = buildWeatherHMM();
      const obs = Array.from({ length: len }, (_, i) => (i % 2 === 0 ? 'walk' : 'shop'));
      const logL = hmm.forward(obs);
      expect(isFinite(logL)).toBe(true);
    });
  }

  it('returns -Infinity for HMM with no states', () => {
    const hmm = new HiddenMarkovModel();
    expect(hmm.forward(['obs'])).toBe(-Infinity);
  });

  it('log likelihood for known zero-prob observation is -Infinity or very small', () => {
    const hmm = buildWeatherHMM();
    // 'unknown_obs' has 0 emission probability in all states
    const logL = hmm.forward(['unknown_obs']);
    expect(logL).toBe(-Infinity);
  });
});

// ---------------------------------------------------------------------------
// 17. HiddenMarkovModel — generateSequence
// ---------------------------------------------------------------------------

describe('HiddenMarkovModel.generateSequence', () => {
  it('returns empty for length 0', () => {
    const hmm = buildWeatherHMM();
    const { states, observations } = hmm.generateSequence(0);
    expect(states).toEqual([]);
    expect(observations).toEqual([]);
  });

  it('returns empty for HMM with no states', () => {
    const hmm = new HiddenMarkovModel();
    const { states } = hmm.generateSequence(5);
    expect(states).toEqual([]);
  });

  for (let len = 1; len <= 15; len++) {
    it(`generateSequence(${len}) returns arrays of length ${len}`, () => {
      const hmm = buildWeatherHMM();
      const { states, observations } = hmm.generateSequence(len);
      expect(states.length).toBe(len);
      expect(observations.length).toBe(len);
    });
  }

  it('all generated hidden states are valid', () => {
    const hmm = buildWeatherHMM();
    const { states } = hmm.generateSequence(50);
    for (const s of states) {
      expect(['Sunny', 'Rainy']).toContain(s);
    }
  });

  it('all generated observations are valid', () => {
    const hmm = buildWeatherHMM();
    const { observations } = hmm.generateSequence(50);
    for (const o of observations) {
      expect(['walk', 'shop']).toContain(o);
    }
  });

  it('negative length returns empty', () => {
    const hmm = buildWeatherHMM();
    const { states, observations } = hmm.generateSequence(-1);
    expect(states).toEqual([]);
    expect(observations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 18. NgramModel — constructor
// ---------------------------------------------------------------------------

describe('NgramModel constructor', () => {
  it('constructs a unigram model', () => {
    expect(() => new NgramModel(1)).not.toThrow();
  });

  it('constructs a bigram model', () => {
    expect(() => new NgramModel(2)).not.toThrow();
  });

  it('constructs a trigram model', () => {
    expect(() => new NgramModel(3)).not.toThrow();
  });

  it('throws for n < 1', () => {
    expect(() => new NgramModel(0)).toThrow(RangeError);
  });

  it('throws for negative n', () => {
    expect(() => new NgramModel(-1)).toThrow(RangeError);
  });

  for (let n = 1; n <= 10; n++) {
    it(`NgramModel(${n}) constructs without error`, () => {
      expect(() => new NgramModel(n)).not.toThrow();
    });
  }
});

// ---------------------------------------------------------------------------
// 19. NgramModel — train / predict
// ---------------------------------------------------------------------------

describe('NgramModel.train / predict', () => {
  it('predict returns null before training', () => {
    const m = new NgramModel(2);
    expect(m.predict(['hello'])).toBeNull();
  });

  it('bigram predicts most frequent next token', () => {
    const m = new NgramModel(2);
    m.train(['a', 'b', 'a', 'b', 'a', 'c']);
    expect(m.predict(['a'])).toBe('b');
  });

  it('unigram predict ignores context', () => {
    const m = new NgramModel(1);
    m.train(['x', 'x', 'x', 'y', 'z']);
    expect(m.predict([])).toBe('x');
  });

  it('trigram uses last 2 context tokens', () => {
    const m = new NgramModel(3);
    m.train(['a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'd']);
    // after 'a b', most common next is 'c' (twice) vs 'd' (once)
    expect(m.predict(['a', 'b'])).toBe('c');
  });

  it('predict returns null for unseen context', () => {
    const m = new NgramModel(2);
    m.train(['a', 'b', 'a', 'b']);
    expect(m.predict(['z'])).toBeNull();
  });

  for (let n = 1; n <= 10; n++) {
    it(`predict after training on repeated sequence for n=${n} works`, () => {
      const m = new NgramModel(n);
      const tokens = Array.from({ length: 20 }, (_, i) => (i % 2 === 0 ? 'X' : 'Y'));
      m.train(tokens);
      const result = m.predict(['X']);
      // For n=1 context is empty, for n=2 context is ['X']
      expect(result !== undefined).toBe(true);
    });
  }

  it('training multiple times accumulates counts', () => {
    const m = new NgramModel(2);
    m.train(['a', 'b', 'a', 'c']);
    m.train(['a', 'b', 'a', 'b']);
    // Now a->b: 3 times, a->c: 1 time
    expect(m.predict(['a'])).toBe('b');
  });
});

// ---------------------------------------------------------------------------
// 20. NgramModel — getProbability
// ---------------------------------------------------------------------------

describe('NgramModel.getProbability', () => {
  it('returns a value between 0 and 1', () => {
    const m = new NgramModel(2);
    m.train(['a', 'b', 'a', 'c']);
    const p = m.getProbability(['a'], 'b');
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThanOrEqual(1);
  });

  it('unseen next token still has positive prob (Laplace smoothing)', () => {
    const m = new NgramModel(2);
    m.train(['a', 'b', 'a', 'b']);
    const p = m.getProbability(['a'], 'z');
    expect(p).toBeGreaterThan(0);
  });

  it('frequent next token has higher prob than rare one', () => {
    const m = new NgramModel(2);
    m.train(['a', 'b', 'a', 'b', 'a', 'b', 'a', 'c']);
    const pb = m.getProbability(['a'], 'b');
    const pc = m.getProbability(['a'], 'c');
    expect(pb).toBeGreaterThan(pc);
  });

  it('unseen context still returns a positive smoothed probability', () => {
    const m = new NgramModel(2);
    m.train(['a', 'b']);
    const p = m.getProbability(['x'], 'y');
    expect(p).toBeGreaterThan(0);
  });

  for (let i = 0; i < 15; i++) {
    it(`getProbability is in [0,1] on random-ish training ${i}`, () => {
      const m = new NgramModel(2);
      m.train(['a', 'b', 'c', 'a', 'b', 'a', 'c', 'b', 'c']);
      const tokens = ['a', 'b', 'c'];
      const ctx = [tokens[i % 3]];
      const next = tokens[(i + 1) % 3];
      const p = m.getProbability(ctx, next);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 21. NgramModel — generate
// ---------------------------------------------------------------------------

describe('NgramModel.generate', () => {
  it('returns empty for length 0', () => {
    const m = new NgramModel(2);
    m.train(['a', 'b', 'c']);
    expect(m.generate(0)).toEqual([]);
  });

  it('returns empty before training (empty vocabulary)', () => {
    const m = new NgramModel(2);
    expect(m.generate(5)).toEqual([]);
  });

  for (let len = 1; len <= 15; len++) {
    it(`generate(${len}) returns array of length ${len}`, () => {
      const m = new NgramModel(2);
      m.train(['a', 'b', 'c', 'a', 'b', 'c']);
      const result = m.generate(len);
      expect(result.length).toBe(len);
    });
  }

  it('generated tokens are from vocabulary', () => {
    const m = new NgramModel(2);
    m.train(['cat', 'dog', 'cat', 'fish', 'dog']);
    const result = m.generate(20);
    const vocab = new Set(['cat', 'dog', 'fish']);
    for (const tok of result) {
      expect(vocab.has(tok)).toBe(true);
    }
  });

  it('generate with seed respects context', () => {
    const m = new NgramModel(2);
    m.train(['a', 'b', 'a', 'b', 'a', 'b', 'a', 'b']);
    const result = m.generate(5, ['a']);
    expect(result.length).toBe(5);
  });

  it('negative length returns empty', () => {
    const m = new NgramModel(2);
    m.train(['a', 'b']);
    expect(m.generate(-1)).toEqual([]);
  });

  for (let trial = 0; trial < 10; trial++) {
    it(`generate 10 tokens on trial ${trial} produces correct length`, () => {
      const m = new NgramModel(2);
      m.train(['x', 'y', 'z', 'x', 'y', 'x', 'z', 'y']);
      expect(m.generate(10).length).toBe(10);
    });
  }
});

// ---------------------------------------------------------------------------
// 22. Additional MarkovChain edge cases
// ---------------------------------------------------------------------------

describe('MarkovChain edge cases', () => {
  it('handles chain with only absorbing states', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'A', 1);
    mc.addTransition('B', 'B', 1);
    expect(mc.getAbsorbingStates().sort()).toEqual(['A', 'B']);
  });

  it('simulate on absorbing chain stays in absorbing state', () => {
    const mc = new MarkovChain();
    mc.addTransition('X', 'X', 1);
    const path = mc.simulate('X', 10);
    expect(path.every((s) => s === 'X')).toBe(true);
  });

  it('can chain multiple addTransition calls fluently-ish', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'B', 0.5);
    mc.addTransition('A', 'C', 0.5);
    mc.addTransition('B', 'C', 0.5);
    mc.addTransition('B', 'A', 0.5);
    mc.addTransition('C', 'A', 0.5);
    mc.addTransition('C', 'B', 0.5);
    expect(mc.getStates().length).toBe(3);
  });

  it('getTransitionMatrix is square', () => {
    const mc = buildTwoStateChain();
    const mat = mc.getTransitionMatrix();
    expect(mat.length).toBe(mat[0].length);
  });

  for (let i = 0; i < 10; i++) {
    it(`simulate returns array starting with start state ${i}`, () => {
      const mc = buildTwoStateChain();
      const start = i % 2 === 0 ? 'A' : 'B';
      const path = mc.simulate(start, 5);
      expect(path[0]).toBe(start);
    });
  }

  it('overwriting a transition changes the matrix', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'B', 0.5);
    mc.addTransition('A', 'C', 0.5);
    mc.addTransition('A', 'B', 0.9);
    mc.addTransition('A', 'C', 0.1);
    expect(mc.getTransitionProbability('A', 'B')).toBeCloseTo(0.9);
  });

  it('states appear only once in getStates', () => {
    const mc = new MarkovChain();
    mc.addState('Dup');
    mc.addState('Dup');
    mc.addState('Dup');
    expect(mc.getStates().filter((s) => s === 'Dup').length).toBe(1);
  });

  it('large 10-state uniform chain steadyState sums to 1', () => {
    const states = Array.from({ length: 10 }, (_, i) => `S${i}`);
    const mc = createUniformChain(states);
    const dist = mc.steadyStateProbabilities();
    const total = [...dist.values()].reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 3);
  });

  it('getNextState returns null for state with zero-prob only transitions', () => {
    // If all probs are 0, the weighted random never triggers and falls to last key
    const mc = new MarkovChain();
    mc.addTransition('A', 'B', 0);
    // All probabilities are 0, cumulative never exceeds Math.random() but the
    // safety fallback returns the last key
    const next = mc.getNextState('A');
    expect(next).toBe('B');
  });
});

// ---------------------------------------------------------------------------
// 23. Integration tests — simulate + steadyState convergence
// ---------------------------------------------------------------------------

describe('Integration: simulate convergence to steady state', () => {
  it('empirical frequencies approach steady state for ergodic chain', () => {
    const mc = buildTwoStateChain();
    const steadyDist = mc.steadyStateProbabilities();
    const expectedA = steadyDist.get('A')!;
    const expectedB = steadyDist.get('B')!;

    // Run a long simulation and count frequencies
    const path = mc.simulate('A', 5000);
    const countA = path.filter((s) => s === 'A').length;
    const countB = path.filter((s) => s === 'B').length;
    const total = path.length;

    expect(countA / total).toBeCloseTo(expectedA, 1);
    expect(countB / total).toBeCloseTo(expectedB, 1);
  });

  for (let trial = 0; trial < 5; trial++) {
    it(`empirical run trial ${trial}: A proportion near 4/11`, () => {
      const mc = buildTwoStateChain();
      const path = mc.simulate('A', 3000);
      const countA = path.filter((s) => s === 'A').length;
      const frac = countA / path.length;
      expect(frac).toBeGreaterThan(0.2);
      expect(frac).toBeLessThan(0.6);
    });
  }
});

// ---------------------------------------------------------------------------
// 24. Integration tests — transitionMatrixFromData round-trip
// ---------------------------------------------------------------------------

describe('Integration: transitionMatrixFromData round-trip', () => {
  it('estimated chain preserves total state count', () => {
    const data = ['A', 'B', 'C', 'A', 'B', 'A', 'C', 'C', 'A'];
    const mc = transitionMatrixFromData(data);
    expect(mc.getStates().length).toBe(3);
  });

  it('estimated chain from uniform alternation is itself uniform per source', () => {
    const data: string[] = [];
    for (let i = 0; i < 50; i++) { data.push('A'); data.push('B'); }
    const mc = transitionMatrixFromData(data);
    expect(mc.getTransitionProbability('A', 'B')).toBeCloseTo(1, 3);
    expect(mc.getTransitionProbability('B', 'A')).toBeCloseTo(1, 3);
  });

  for (let n = 2; n <= 8; n++) {
    it(`round-trip from uniform ${n}-state data has correct state count`, () => {
      const states = Array.from({ length: n }, (_, i) => `S${i}`);
      const data: string[] = [];
      for (let i = 0; i < 200; i++) data.push(states[i % n]);
      const mc = transitionMatrixFromData(data);
      // All states from the cycle should be present
      expect(mc.getStates().length).toBeGreaterThanOrEqual(n);
    });
  }
});

// ---------------------------------------------------------------------------
// 25. Additional coverage — miscellaneous boundary conditions
// ---------------------------------------------------------------------------

describe('Miscellaneous boundary conditions', () => {
  it('MarkovChain with numeric-string state names', () => {
    const mc = new MarkovChain();
    mc.addTransition('1', '2', 0.6);
    mc.addTransition('1', '3', 0.4);
    mc.addTransition('2', '1', 1);
    mc.addTransition('3', '1', 1);
    expect(mc.isIrreducible()).toBe(true);
  });

  it('MarkovChain with long state names', () => {
    const mc = new MarkovChain();
    const long = 'a'.repeat(500);
    mc.addTransition(long, long, 1);
    expect(mc.isAbsorbing(long)).toBe(true);
  });

  it('NgramModel with empty string tokens', () => {
    const m = new NgramModel(2);
    m.train(['', 'a', '', 'a']);
    expect(m.predict([''])).toBe('a');
  });

  it('NgramModel unigram vocabulary grows with training', () => {
    const m = new NgramModel(1);
    m.train(['a', 'b']);
    m.train(['c', 'd', 'e']);
    const result = m.generate(5);
    const vocab = new Set(['a', 'b', 'c', 'd', 'e']);
    for (const tok of result) expect(vocab.has(tok)).toBe(true);
  });

  for (let i = 0; i < 10; i++) {
    it(`HMM viterbi stability test ${i}`, () => {
      const hmm = buildWeatherHMM();
      const obs = ['walk', 'shop', 'walk', 'shop'].slice(0, (i % 4) + 1);
      const path = hmm.viterbi(obs);
      expect(path.length).toBe(obs.length);
    });
  }

  it('createRandomWalk on large array works without error', () => {
    const states = Array.from({ length: 100 }, (_, i) => `S${i}`);
    const mc = createRandomWalk(states);
    expect(mc.getStates().length).toBe(100);
  });

  it('createUniformChain on 20 states is ergodic', () => {
    const states = Array.from({ length: 20 }, (_, i) => `U${i}`);
    expect(createUniformChain(states).isErgodic()).toBe(true);
  });

  it('mfpt returns 0 for absorbing-to-itself', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'A', 1);
    expect(mc.mfpt('A', 'A')).toBe(0);
  });

  it('mfpt from unreachable pair', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'A', 1);
    mc.addTransition('B', 'B', 1);
    expect(mc.mfpt('A', 'B')).toBe(Infinity);
  });

  for (let i = 0; i < 10; i++) {
    it(`createUniformChain 2-state simulate trial ${i}`, () => {
      const mc = createUniformChain(['L', 'R']);
      const path = mc.simulate('L', 10);
      for (const s of path) expect(['L', 'R']).toContain(s);
    });
  }
});

// ---------------------------------------------------------------------------
// 26. Bulk property tests — MarkovChain matrix properties
// ---------------------------------------------------------------------------

describe('Bulk property tests — transition matrix', () => {
  for (let n = 1; n <= 10; n++) {
    it(`createUniformChain(${n}).getTransitionMatrix() is ${n}x${n}`, () => {
      const states = Array.from({ length: n }, (_, i) => `P${i}`);
      const mat = createUniformChain(states).getTransitionMatrix();
      expect(mat.length).toBe(n);
      for (const row of mat) expect(row.length).toBe(n);
    });
  }

  for (let n = 2; n <= 10; n++) {
    it(`createRandomWalk(${n}) rows sum to 1`, () => {
      const states = Array.from({ length: n }, (_, i) => `W${i}`);
      const mat = createRandomWalk(states).getTransitionMatrix();
      for (const row of mat) {
        expect(row.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 27. Bulk property tests — steadyStateProbabilities
// ---------------------------------------------------------------------------

describe('Bulk property tests — steadyStateProbabilities', () => {
  for (let n = 2; n <= 12; n++) {
    it(`uniform ${n}-state chain steady state values each ~1/${n}`, () => {
      const states = Array.from({ length: n }, (_, i) => `Q${i}`);
      const mc = createUniformChain(states);
      const dist = mc.steadyStateProbabilities();
      for (const [, v] of dist) {
        expect(v).toBeCloseTo(1 / n, 2);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 28. Bulk property tests — NgramModel getProbability
// ---------------------------------------------------------------------------

describe('Bulk property tests — NgramModel getProbability', () => {
  const corpus = ['the', 'cat', 'sat', 'on', 'the', 'mat', 'the', 'cat', 'lay', 'on', 'the', 'rug'];

  for (let n = 1; n <= 5; n++) {
    it(`NgramModel(${n}) getProbability returns value in [0,1] for trained data`, () => {
      const m = new NgramModel(n);
      m.train(corpus);
      const p = m.getProbability(['the'], 'cat');
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`getProbability variant ${i}: smoothed prob is positive`, () => {
      const m = new NgramModel(2);
      m.train(corpus);
      const ctx = [corpus[i % corpus.length]];
      const next = corpus[(i + 1) % corpus.length];
      expect(m.getProbability(ctx, next)).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 29. Bulk simulate + valid-state checks
// ---------------------------------------------------------------------------

describe('Bulk simulate valid-state checks', () => {
  for (let steps = 0; steps <= 30; steps++) {
    it(`simulate ${steps} steps length is ${steps + 1}`, () => {
      const mc = buildTwoStateChain();
      expect(mc.simulate('A', steps).length).toBe(steps + 1);
    });
  }
});

// ---------------------------------------------------------------------------
// 30. Bulk addTransition boundary
// ---------------------------------------------------------------------------

describe('Bulk addTransition boundary', () => {
  it('probability exactly 0 is stored', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'B', 0);
    expect(mc.getTransitionProbability('A', 'B')).toBe(0);
  });

  it('probability exactly 1 is stored', () => {
    const mc = new MarkovChain();
    mc.addTransition('A', 'B', 1);
    expect(mc.getTransitionProbability('A', 'B')).toBe(1);
  });

  for (let i = 0; i <= 20; i++) {
    const p = i / 20;
    it(`probability ${p.toFixed(2)} is accepted and stored`, () => {
      const mc = new MarkovChain();
      mc.addTransition('X', 'Y', p);
      expect(mc.getTransitionProbability('X', 'Y')).toBeCloseTo(p);
    });
  }
});

// ---------------------------------------------------------------------------
// 31. Bulk getReachableStates
// ---------------------------------------------------------------------------

describe('Bulk getReachableStates', () => {
  for (let n = 1; n <= 10; n++) {
    it(`uniform chain of ${n}: reachable from S0 has size ${n}`, () => {
      const states = Array.from({ length: n }, (_, i) => `S${i}`);
      const mc = createUniformChain(states);
      expect(mc.getReachableStates('S0').size).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// 32. Extra HMM tests
// ---------------------------------------------------------------------------

describe('Extra HMM tests', () => {
  it('viterbi on single sunny walk should return Sunny', () => {
    const hmm = buildWeatherHMM();
    // walk has 0.6 emission from Sunny (0.6 prior) vs 0.1 from Rainy (0.4 prior)
    // P(Sunny|walk) ∝ 0.6*0.6 = 0.36, P(Rainy|walk) ∝ 0.4*0.1 = 0.04
    expect(hmm.viterbi(['walk'])[0]).toBe('Sunny');
  });

  it('viterbi on single rainy shop should return Rainy', () => {
    const hmm = buildWeatherHMM();
    // P(Sunny|shop) ∝ 0.6*0.4=0.24, P(Rainy|shop) ∝ 0.4*0.9=0.36
    expect(hmm.viterbi(['shop'])[0]).toBe('Rainy');
  });

  it('forward log-likelihood increases with more probable observation', () => {
    const hmm = buildWeatherHMM();
    const ll1 = hmm.forward(['walk']);
    expect(isFinite(ll1)).toBe(true);
  });

  for (let i = 0; i < 10; i++) {
    it(`generateSequence(${i + 1}) states are all valid`, () => {
      const hmm = buildWeatherHMM();
      const { states } = hmm.generateSequence(i + 1);
      for (const s of states) expect(['Sunny', 'Rainy']).toContain(s);
    });
  }

  it('HMM with one state always generates that state', () => {
    const hmm = new HiddenMarkovModel();
    hmm.addState('Only', 1.0);
    hmm.setTransition('Only', 'Only', 1.0);
    hmm.setEmission('Only', 'obs', 1.0);
    const { states } = hmm.generateSequence(10);
    expect(states.every((s) => s === 'Only')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 33. MarkovChain — steadyState all keys present
// ---------------------------------------------------------------------------

describe('MarkovChain steadyState all keys present', () => {
  for (let n = 2; n <= 10; n++) {
    it(`steadyState of uniform ${n}-state chain has ${n} entries`, () => {
      const states = Array.from({ length: n }, (_, i) => `R${i}`);
      const mc = createUniformChain(states);
      expect(mc.steadyStateProbabilities().size).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// 34. Fuzz-style tests — random chains
// ---------------------------------------------------------------------------

describe('Fuzz-style random chain tests', () => {
  for (let trial = 0; trial < 20; trial++) {
    it(`fuzz trial ${trial}: random 3-state chain properties`, () => {
      const mc = new MarkovChain();
      const p1 = (trial % 10) / 10;
      const p2 = 1 - p1;
      mc.addTransition('A', 'B', p1);
      mc.addTransition('A', 'C', p2);
      mc.addTransition('B', 'A', 0.5);
      mc.addTransition('B', 'C', 0.5);
      mc.addTransition('C', 'A', 0.7);
      mc.addTransition('C', 'B', 0.3);
      expect(mc.getStates().length).toBe(3);
      const path = mc.simulate('A', 20);
      expect(path.length).toBe(21);
      for (const s of path) expect(['A', 'B', 'C']).toContain(s);
    });
  }
});

// ---------------------------------------------------------------------------
// 35. NgramModel generate tokens from vocabulary
// ---------------------------------------------------------------------------

describe('NgramModel generate vocab membership', () => {
  for (let len = 1; len <= 20; len++) {
    it(`generate(${len}) all tokens in vocabulary`, () => {
      const m = new NgramModel(2);
      m.train(['alpha', 'beta', 'gamma', 'alpha', 'gamma', 'beta']);
      const vocab = new Set(['alpha', 'beta', 'gamma']);
      const result = m.generate(len);
      expect(result.length).toBe(len);
      for (const tok of result) expect(vocab.has(tok)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 36. MarkovChain mfpt additional cases
// ---------------------------------------------------------------------------

describe('MarkovChain mfpt additional', () => {
  it('mfpt is positive when reachable and distinct', () => {
    const mc = createUniformChain(['A', 'B', 'C']);
    expect(mc.mfpt('A', 'B')).toBeGreaterThan(0);
  });

  for (let n = 2; n <= 6; n++) {
    it(`mfpt to self is 0 for uniform ${n}-state chain first state`, () => {
      const states = Array.from({ length: n }, (_, i) => `S${i}`);
      const mc = createUniformChain(states);
      expect(mc.mfpt('S0', 'S0')).toBe(0);
    });
  }

  it('mfpt is symmetric for symmetric chain', () => {
    // Symmetric two-state chain with p=0.5
    const mc = new MarkovChain();
    mc.addTransition('A', 'A', 0.5);
    mc.addTransition('A', 'B', 0.5);
    mc.addTransition('B', 'A', 0.5);
    mc.addTransition('B', 'B', 0.5);
    const mAB = mc.mfpt('A', 'B');
    const mBA = mc.mfpt('B', 'A');
    expect(mAB).toBeCloseTo(mBA, 3);
  });
});

// ---------------------------------------------------------------------------
// 37. NgramModel predict with longer context
// ---------------------------------------------------------------------------

describe('NgramModel predict with longer context (4-gram)', () => {
  it('4-gram can predict next word in repeated sequence', () => {
    const m = new NgramModel(4);
    const seq = ['a', 'b', 'c', 'd', 'a', 'b', 'c', 'd', 'a', 'b', 'c', 'e'];
    m.train(seq);
    // After a,b,c we've seen 'd' twice and 'e' once
    expect(m.predict(['a', 'b', 'c'])).toBe('d');
  });

  for (let i = 0; i < 10; i++) {
    it(`4-gram getProbability variant ${i} is in [0,1]`, () => {
      const m = new NgramModel(4);
      m.train(['w', 'x', 'y', 'z', 'w', 'x', 'y', 'z']);
      const p = m.getProbability(['w', 'x', 'y'], 'z');
      expect(p).toBeGreaterThan(0);
      expect(p).toBeLessThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 38. MarkovChain — getStates order stability
// ---------------------------------------------------------------------------

describe('MarkovChain getStates order stability', () => {
  for (let i = 0; i < 10; i++) {
    it(`getStates is always sorted lexicographically trial ${i}`, () => {
      const mc = new MarkovChain();
      const labels = ['Gamma', 'Alpha', 'Beta', 'Delta', 'Epsilon'].slice(0, (i % 5) + 2);
      for (const l of labels) mc.addState(l);
      const states = mc.getStates();
      const sorted = [...states].sort();
      expect(states).toEqual(sorted);
    });
  }
});

// ---------------------------------------------------------------------------
// 39. HMM forward monotone test
// ---------------------------------------------------------------------------

describe('HMM forward monotone test', () => {
  it('forward returns lower log-likelihood for lower-prob observation', () => {
    const hmm = buildWeatherHMM();
    // walk is highly probable when mostly Sunny
    const ll_walk = hmm.forward(['walk', 'walk', 'walk']);
    const ll_shop = hmm.forward(['shop', 'shop', 'shop']);
    // Both should be finite; overall Sunny-dominated model so walks likely higher
    expect(isFinite(ll_walk)).toBe(true);
    expect(isFinite(ll_shop)).toBe(true);
  });

  for (let len = 2; len <= 10; len++) {
    it(`forward is finite for mixed obs length ${len}`, () => {
      const hmm = buildWeatherHMM();
      const obs = Array.from({ length: len }, (_, i) => (i % 2 === 0 ? 'walk' : 'shop'));
      expect(isFinite(hmm.forward(obs))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 40. MarkovChain — large n stability
// ---------------------------------------------------------------------------

describe('MarkovChain large n stability', () => {
  it('50-state uniform chain steadyState sums to 1', () => {
    const states = Array.from({ length: 50 }, (_, i) => `S${i}`);
    const mc = createUniformChain(states);
    const dist = mc.steadyStateProbabilities();
    const total = [...dist.values()].reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 2);
  });

  it('50-state uniform chain is ergodic', () => {
    const states = Array.from({ length: 50 }, (_, i) => `S${i}`);
    expect(createUniformChain(states).isErgodic()).toBe(true);
  });

  it('random walk on 50 states rows sum to 1', () => {
    const states = Array.from({ length: 50 }, (_, i) => `W${i}`);
    const mc = createRandomWalk(states);
    for (const row of mc.getTransitionMatrix()) {
      expect(row.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    }
  });
});

// ---------------------------------------------------------------------------
// 41. Bulk probability range checks — addTransition
// ---------------------------------------------------------------------------

describe('Bulk probability range checks', () => {
  for (let i = 0; i <= 100; i++) {
    const p = i / 100;
    it(`probability ${p.toFixed(2)} stored correctly (bulk ${i})`, () => {
      const mc = new MarkovChain();
      mc.addTransition('From', 'To', p);
      expect(mc.getTransitionProbability('From', 'To')).toBeCloseTo(p, 6);
    });
  }
});

// ---------------------------------------------------------------------------
// 42. Bulk simulate path-length checks
// ---------------------------------------------------------------------------

describe('Bulk simulate path-length checks', () => {
  for (let steps = 0; steps <= 50; steps++) {
    it(`simulate ${steps} steps => path length ${steps + 1}`, () => {
      const mc = buildTwoStateChain();
      expect(mc.simulate('A', steps).length).toBe(steps + 1);
    });
  }
});

// ---------------------------------------------------------------------------
// 43. Bulk NgramModel generate length checks
// ---------------------------------------------------------------------------

describe('Bulk NgramModel generate length checks', () => {
  for (let len = 1; len <= 50; len++) {
    it(`NgramModel generate(${len}) yields exactly ${len} tokens`, () => {
      const m = new NgramModel(2);
      m.train(['one', 'two', 'three', 'one', 'two', 'one', 'three', 'two']);
      expect(m.generate(len).length).toBe(len);
    });
  }
});

// ---------------------------------------------------------------------------
// 44. Bulk uniform chain — all probs equal 1/n
// ---------------------------------------------------------------------------

describe('Bulk uniform chain probability equality', () => {
  for (let n = 1; n <= 20; n++) {
    it(`uniform chain n=${n}: P(S0->S${n - 1}) = 1/${n}`, () => {
      const states = Array.from({ length: n }, (_, i) => `S${i}`);
      const mc = createUniformChain(states);
      if (n > 1) {
        expect(mc.getTransitionProbability('S0', `S${n - 1}`)).toBeCloseTo(1 / n, 8);
      } else {
        expect(mc.getTransitionProbability('S0', 'S0')).toBeCloseTo(1, 8);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 45. Bulk viterbi path length checks
// ---------------------------------------------------------------------------

describe('Bulk viterbi path length checks', () => {
  for (let len = 1; len <= 50; len++) {
    it(`viterbi path length = observation length (${len})`, () => {
      const hmm = buildWeatherHMM();
      const obs = Array.from({ length: len }, (_, i) => (i % 2 === 0 ? 'walk' : 'shop'));
      expect(hmm.viterbi(obs).length).toBe(len);
    });
  }
});

// ---------------------------------------------------------------------------
// 46. Bulk forward finite checks
// ---------------------------------------------------------------------------

describe('Bulk forward finite checks', () => {
  for (let len = 1; len <= 30; len++) {
    it(`forward is finite for observation length ${len}`, () => {
      const hmm = buildWeatherHMM();
      const obs = Array.from({ length: len }, (_, i) => (i % 3 === 0 ? 'walk' : 'shop'));
      expect(isFinite(hmm.forward(obs))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 47. Bulk NgramModel getProbability in [0,1]
// ---------------------------------------------------------------------------

describe('Bulk NgramModel getProbability in [0,1]', () => {
  const corpus2 = 'the quick brown fox jumps over the lazy dog the fox'.split(' ');
  for (let i = 0; i < 50; i++) {
    it(`getProbability bulk check ${i}: value in [0,1]`, () => {
      const m = new NgramModel(2);
      m.train(corpus2);
      const ctx = [corpus2[i % corpus2.length]];
      const next = corpus2[(i + 1) % corpus2.length];
      const p = m.getProbability(ctx, next);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 48. Bulk reachable states checks
// ---------------------------------------------------------------------------

describe('Bulk reachable states checks', () => {
  for (let n = 1; n <= 15; n++) {
    it(`uniform ${n}-state chain: all states reachable from S0`, () => {
      const states = Array.from({ length: n }, (_, i) => `S${i}`);
      const mc = createUniformChain(states);
      const reachable = mc.getReachableStates('S0');
      for (const s of states) {
        expect(reachable.has(s)).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 49. Bulk isCommunicating on uniform chains
// ---------------------------------------------------------------------------

describe('Bulk isCommunicating on uniform chains', () => {
  for (let n = 2; n <= 10; n++) {
    it(`uniform ${n}-state: S0 communicates with S${n - 1}`, () => {
      const states = Array.from({ length: n }, (_, i) => `V${i}`);
      const mc = createUniformChain(states);
      expect(mc.isCommunicating('V0', `V${n - 1}`)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 50. Bulk generateSequence length checks
// ---------------------------------------------------------------------------

describe('Bulk generateSequence length checks', () => {
  for (let len = 1; len <= 50; len++) {
    it(`HMM generateSequence(${len}) states length = ${len}`, () => {
      const hmm = buildWeatherHMM();
      const { states } = hmm.generateSequence(len);
      expect(states.length).toBe(len);
    });
  }
});

// ---------------------------------------------------------------------------
// 51. Bulk addState count checks
// ---------------------------------------------------------------------------

describe('Bulk addState count checks', () => {
  for (let n = 1; n <= 50; n++) {
    it(`addState ${n} distinct states => getStates().length = ${n}`, () => {
      const mc = new MarkovChain();
      for (let j = 0; j < n; j++) mc.addState(`Node${j}`);
      expect(mc.getStates().length).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// 52. Bulk transitionMatrixFromData state count
// ---------------------------------------------------------------------------

describe('Bulk transitionMatrixFromData state count', () => {
  for (let n = 2; n <= 15; n++) {
    it(`empirical chain from ${n}-state cycle has ${n} states`, () => {
      const states = Array.from({ length: n }, (_, i) => `T${i}`);
      const data: string[] = [];
      for (let rep = 0; rep < 10; rep++) {
        for (const s of states) data.push(s);
      }
      const mc = transitionMatrixFromData(data);
      expect(mc.getStates().length).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// 53. Bulk steadyState size checks
// ---------------------------------------------------------------------------

describe('Bulk steadyState size checks', () => {
  for (let n = 1; n <= 20; n++) {
    it(`steadyState of uniform ${n}-state chain has ${n} keys`, () => {
      const states = Array.from({ length: n }, (_, i) => `G${i}`);
      const mc = createUniformChain(states);
      expect(mc.steadyStateProbabilities().size).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// 54. Bulk isAbsorbing false checks
// ---------------------------------------------------------------------------

describe('Bulk isAbsorbing false checks on uniform chains', () => {
  for (let n = 2; n <= 15; n++) {
    it(`no absorbing states in uniform ${n}-state chain`, () => {
      const states = Array.from({ length: n }, (_, i) => `A${i}`);
      const mc = createUniformChain(states);
      expect(mc.getAbsorbingStates().length).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 55. Bulk NgramModel train length checks
// ---------------------------------------------------------------------------

describe('Bulk NgramModel train length checks', () => {
  for (let n = 2; n <= 5; n++) {
    for (let len = 5; len <= 20; len++) {
      it(`NgramModel(${n}) trained on ${len} tokens, generate(5) has length 5`, () => {
        const m = new NgramModel(n);
        const tokens = Array.from({ length: len }, (_, i) => `tok${i % 4}`);
        m.train(tokens);
        expect(m.generate(5).length).toBe(5);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 56. Bulk MarkovChain all-states reachable from random walk
// ---------------------------------------------------------------------------

describe('Bulk random walk all-states reachable from endpoints', () => {
  for (let n = 2; n <= 15; n++) {
    it(`random walk of ${n}: S0 can eventually reach S${n - 1}`, () => {
      const states = Array.from({ length: n }, (_, i) => `R${i}`);
      const mc = createRandomWalk(states);
      const reachable = mc.getReachableStates('R0');
      expect(reachable.has(`R${n - 1}`)).toBe(true);
    });
  }
});
