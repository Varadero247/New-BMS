// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ---------------------------------------------------------------------------
// DFA — Deterministic Finite Automaton
// ---------------------------------------------------------------------------

/**
 * Deterministic Finite Automaton.
 *
 * States are strings; the alphabet is a Set<string> of single-character symbols.
 * Transitions are stored as Map<fromState, Map<symbol, toState>>.
 */
export class DFA {
  states: Set<string>;
  alphabet: Set<string>;
  /** transitions[from][symbol] = to */
  transitions: Map<string, Map<string, string>>;
  startState: string;
  acceptStates: Set<string>;

  constructor(startState: string) {
    this.states = new Set<string>();
    this.alphabet = new Set<string>();
    this.transitions = new Map<string, Map<string, string>>();
    this.startState = startState;
    this.acceptStates = new Set<string>();
    this.states.add(startState);
  }

  /** Add a state.  Pass isAccept=true to mark it as an accept state. */
  addState(state: string, isAccept = false): void {
    this.states.add(state);
    if (isAccept) this.acceptStates.add(state);
  }

  /** Register a transition: on reading `symbol` in `from`, move to `to`. */
  addTransition(from: string, symbol: string, to: string): void {
    this.states.add(from);
    this.states.add(to);
    if (symbol !== '') this.alphabet.add(symbol);
    if (!this.transitions.has(from)) this.transitions.set(from, new Map());
    this.transitions.get(from)!.set(symbol, to);
  }

  /**
   * Simulate the DFA on `input`.
   * Returns true iff the DFA ends in an accept state.
   */
  accepts(input: string): boolean {
    let current = this.startState;
    for (const ch of input) {
      const row = this.transitions.get(current);
      if (!row || !row.has(ch)) return false;
      current = row.get(ch)!;
    }
    return this.acceptStates.has(current);
  }

  /**
   * BFS/DFS from startState to find all reachable states.
   */
  getReachableStates(): Set<string> {
    const visited = new Set<string>();
    const queue: string[] = [this.startState];
    while (queue.length > 0) {
      const state = queue.shift()!;
      if (visited.has(state)) continue;
      visited.add(state);
      const row = this.transitions.get(state);
      if (row) {
        for (const next of row.values()) {
          if (!visited.has(next)) queue.push(next);
        }
      }
    }
    return visited;
  }

  /**
   * A DFA is deterministic iff every (state, symbol) pair has at most one target.
   * In this implementation transitions are always deterministic by construction,
   * but we also verify that no state has a duplicate symbol mapping.
   */
  isDeterministic(): boolean {
    for (const [, row] of this.transitions) {
      const seen = new Set<string>();
      for (const sym of row.keys()) {
        if (seen.has(sym)) return false;
        seen.add(sym);
      }
    }
    return true;
  }

  /**
   * Basic minimization: remove unreachable states and their transitions.
   * Returns a new DFA equivalent to this one with dead states pruned.
   */
  minimize(): DFA {
    const reachable = this.getReachableStates();
    const dfa = new DFA(this.startState);
    for (const state of reachable) {
      dfa.addState(state, this.acceptStates.has(state));
    }
    for (const [from, row] of this.transitions) {
      if (!reachable.has(from)) continue;
      for (const [sym, to] of row) {
        if (reachable.has(to)) {
          dfa.addTransition(from, sym, to);
        }
      }
    }
    return dfa;
  }
}

// ---------------------------------------------------------------------------
// NFA — Non-deterministic Finite Automaton
// ---------------------------------------------------------------------------

/** Epsilon symbol constant */
export const EPSILON = '';

/**
 * Non-deterministic Finite Automaton with epsilon transitions.
 *
 * Transitions are Map<fromState, Map<symbol, Set<toState>>>.
 * Epsilon transitions use the empty string '' as symbol.
 */
export class NFA {
  states: Set<string>;
  alphabet: Set<string>;
  /** transitions[from][symbol] = Set<toStates> */
  transitions: Map<string, Map<string, Set<string>>>;
  startState: string;
  acceptStates: Set<string>;

  constructor(startState: string) {
    this.states = new Set<string>();
    this.alphabet = new Set<string>();
    this.transitions = new Map<string, Map<string, Set<string>>>();
    this.startState = startState;
    this.acceptStates = new Set<string>();
    this.states.add(startState);
  }

  addState(state: string, isAccept = false): void {
    this.states.add(state);
    if (isAccept) this.acceptStates.add(state);
  }

  addTransition(from: string, symbol: string, to: string): void {
    this.states.add(from);
    this.states.add(to);
    if (symbol !== '') this.alphabet.add(symbol);
    if (!this.transitions.has(from)) this.transitions.set(from, new Map());
    const row = this.transitions.get(from)!;
    if (!row.has(symbol)) row.set(symbol, new Set());
    row.get(symbol)!.add(to);
  }

  /**
   * Compute the epsilon-closure of a set of states:
   * all states reachable by zero or more epsilon transitions.
   */
  epsilonClosure(states: Set<string>): Set<string> {
    const closure = new Set<string>(states);
    const stack = [...states];
    while (stack.length > 0) {
      const state = stack.pop()!;
      const row = this.transitions.get(state);
      if (!row) continue;
      const epsilonTargets = row.get(EPSILON);
      if (!epsilonTargets) continue;
      for (const t of epsilonTargets) {
        if (!closure.has(t)) {
          closure.add(t);
          stack.push(t);
        }
      }
    }
    return closure;
  }

  /**
   * Compute the set of states reachable from `states` on consuming `symbol`
   * (NOT including epsilon closure — call epsilonClosure separately).
   */
  move(states: Set<string>, symbol: string): Set<string> {
    const result = new Set<string>();
    for (const state of states) {
      const row = this.transitions.get(state);
      if (!row) continue;
      const targets = row.get(symbol);
      if (!targets) continue;
      for (const t of targets) result.add(t);
    }
    return result;
  }

  /**
   * Simulate the NFA on `input` using subset construction on-the-fly.
   * Returns true iff any configuration ends in an accept state.
   */
  accepts(input: string): boolean {
    let current = this.epsilonClosure(new Set([this.startState]));
    for (const ch of input) {
      current = this.epsilonClosure(this.move(current, ch));
      if (current.size === 0) return false;
    }
    for (const state of current) {
      if (this.acceptStates.has(state)) return true;
    }
    return false;
  }

  /**
   * Convert this NFA to an equivalent DFA via the subset construction algorithm.
   * DFA states are JSON-serialised sorted arrays of NFA state names.
   */
  toDFA(): DFA {
    const nfaAlphabet = [...this.alphabet]; // only non-epsilon symbols

    const startClosure = this.epsilonClosure(new Set([this.startState]));
    const startLabel = setToLabel(startClosure);

    const dfa = new DFA(startLabel);
    const isAccept = (closure: Set<string>): boolean => {
      for (const s of closure) {
        if (this.acceptStates.has(s)) return true;
      }
      return false;
    };

    dfa.addState(startLabel, isAccept(startClosure));

    const worklist: Set<string>[] = [startClosure];
    const seen = new Map<string, Set<string>>();
    seen.set(startLabel, startClosure);

    while (worklist.length > 0) {
      const current = worklist.shift()!;
      const currentLabel = setToLabel(current);

      for (const sym of nfaAlphabet) {
        const moved = this.move(current, sym);
        const closure = this.epsilonClosure(moved);
        if (closure.size === 0) continue; // dead transition — skip
        const label = setToLabel(closure);
        if (!seen.has(label)) {
          seen.set(label, closure);
          dfa.addState(label, isAccept(closure));
          worklist.push(closure);
        }
        dfa.addTransition(currentLabel, sym, label);
      }
    }

    return dfa;
  }
}

// ---------------------------------------------------------------------------
// Helper: serialise a Set<string> to a stable DFA-state label
// ---------------------------------------------------------------------------

function setToLabel(s: Set<string>): string {
  return '{' + [...s].sort().join(',') + '}';
}

// ---------------------------------------------------------------------------
// RegexToNFA — Thompson's construction helpers
// ---------------------------------------------------------------------------

/**
 * Counter for generating unique state names across NFA constructions.
 */
let _stateCounter = 0;

function freshState(prefix = 'q'): string {
  return `${prefix}${_stateCounter++}`;
}

/** Reset the global state counter (useful in tests for determinism). */
export function resetStateCounter(): void {
  _stateCounter = 0;
}

/**
 * Namespace of static factory methods that build NFAs using
 * Thompson's construction.
 */
export class RegexToNFA {
  /**
   * Build an NFA that accepts exactly the literal string `str`.
   * If str is empty, builds an NFA that accepts only the empty string.
   */
  static fromLiteral(str: string): NFA {
    const start = freshState('s');
    const nfa = new NFA(start);
    let prev = start;
    for (const ch of str) {
      const next = freshState('s');
      nfa.addState(next, false);
      nfa.addTransition(prev, ch, next);
      prev = next;
    }
    nfa.addState(prev, true);
    return nfa;
  }

  /**
   * Build an NFA that accepts strings accepted by `a` OR by `b`.
   * Uses Thompson's union construction with a new start and accept state.
   */
  static fromAlternation(a: NFA, b: NFA): NFA {
    const start = freshState('u');
    const accept = freshState('u');

    // Copy a into a single combined NFA (we operate on references here since
    // all state names are globally unique thanks to freshState)
    const nfa = new NFA(start);
    nfa.addState(start, false);
    nfa.addState(accept, true);

    // Import all states
    for (const s of a.states) nfa.addState(s, false);
    for (const s of b.states) nfa.addState(s, false);

    // Import all transitions
    _importTransitions(nfa, a);
    _importTransitions(nfa, b);

    // Epsilon from new start to both sub-start states
    nfa.addTransition(start, EPSILON, a.startState);
    nfa.addTransition(start, EPSILON, b.startState);

    // Epsilon from both sub-accept states to new accept
    for (const s of a.acceptStates) {
      nfa.acceptStates.delete(s); // not accept in combined
      nfa.addTransition(s, EPSILON, accept);
    }
    for (const s of b.acceptStates) {
      nfa.acceptStates.delete(s);
      nfa.addTransition(s, EPSILON, accept);
    }

    return nfa;
  }

  /**
   * Build an NFA that accepts strings of the form xy where x is in `a` and y is in `b`.
   * Uses Thompson's concatenation construction.
   */
  static fromConcatenation(a: NFA, b: NFA): NFA {
    const nfa = new NFA(a.startState);

    for (const s of a.states) nfa.addState(s, false);
    for (const s of b.states) nfa.addState(s, false);

    _importTransitions(nfa, a);
    _importTransitions(nfa, b);

    // Epsilon from each accept state of a to the start state of b
    for (const s of a.acceptStates) {
      nfa.addTransition(s, EPSILON, b.startState);
    }

    // Accept states are b's accept states
    for (const s of b.acceptStates) {
      nfa.addState(s, true);
    }

    return nfa;
  }

  /**
   * Build an NFA that accepts zero or more repetitions of strings in `nfa`.
   * Uses Thompson's Kleene star construction.
   */
  static fromKleeneStar(inner: NFA): NFA {
    const start = freshState('k');
    const accept = freshState('k');

    const nfa = new NFA(start);
    nfa.addState(start, false);
    nfa.addState(accept, true);

    for (const s of inner.states) nfa.addState(s, false);
    _importTransitions(nfa, inner);

    // Epsilon: new start → inner start, new start → new accept (accept empty)
    nfa.addTransition(start, EPSILON, inner.startState);
    nfa.addTransition(start, EPSILON, accept);

    // Epsilon: each inner accept → inner start (repeat), inner accept → new accept
    for (const s of inner.acceptStates) {
      nfa.addTransition(s, EPSILON, inner.startState);
      nfa.addTransition(s, EPSILON, accept);
    }

    return nfa;
  }
}

/** Copy all transitions from `src` NFA into `dest` NFA. */
function _importTransitions(dest: NFA, src: NFA): void {
  for (const [from, row] of src.transitions) {
    for (const [sym, targets] of row) {
      for (const to of targets) {
        dest.addTransition(from, sym, to);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

/**
 * Convenience factory for creating a DFA from raw data.
 *
 * @param states     All state names.
 * @param alphabet   Alphabet symbols.
 * @param transitions Array of [from, symbol, to] triples.
 * @param start      Start state name.
 * @param accept     Accept state names.
 */
export function createDFA(
  states: string[],
  alphabet: string[],
  transitions: [string, string, string][],
  start: string,
  accept: string[],
): DFA {
  const dfa = new DFA(start);
  for (const s of states) dfa.addState(s, accept.includes(s));
  for (const sym of alphabet) dfa.alphabet.add(sym);
  for (const [from, sym, to] of transitions) dfa.addTransition(from, sym, to);
  return dfa;
}

/**
 * Convenience factory for creating an NFA from raw data.
 *
 * @param states     All state names.
 * @param alphabet   Non-epsilon alphabet symbols.
 * @param transitions Array of [from, symbol, to] triples (use '' for epsilon).
 * @param start      Start state name.
 * @param accept     Accept state names.
 */
export function createNFA(
  states: string[],
  alphabet: string[],
  transitions: [string, string, string][],
  start: string,
  accept: string[],
): NFA {
  const nfa = new NFA(start);
  for (const s of states) nfa.addState(s, accept.includes(s));
  for (const sym of alphabet) if (sym !== '') nfa.alphabet.add(sym);
  for (const [from, sym, to] of transitions) nfa.addTransition(from, sym, to);
  return nfa;
}

// ---------------------------------------------------------------------------
// DFA product construction helpers
// ---------------------------------------------------------------------------

/**
 * Compute the intersection of two DFAs via product construction.
 * The resulting DFA accepts strings accepted by BOTH `a` AND `b`.
 */
export function intersection(a: DFA, b: DFA): DFA {
  return _productDFA(a, b, (aAcc, bAcc) => aAcc && bAcc);
}

/**
 * Compute the union of two DFAs via product construction.
 * The resulting DFA accepts strings accepted by `a` OR `b` (or both).
 */
export function union(a: DFA, b: DFA): DFA {
  return _productDFA(a, b, (aAcc, bAcc) => aAcc || bAcc);
}

/**
 * Internal product-construction DFA builder.
 * `accept` predicate determines which combined states are accepting.
 */
function _productDFA(
  a: DFA,
  b: DFA,
  accept: (aIsAccept: boolean, bIsAccept: boolean) => boolean,
): DFA {
  // Combined alphabet
  const alphabet = new Set([...a.alphabet, ...b.alphabet]);

  const startLabel = pairLabel(a.startState, b.startState);
  const dfa = new DFA(startLabel);

  const isAcceptPair = (sa: string, sb: string) =>
    accept(a.acceptStates.has(sa), b.acceptStates.has(sb));

  dfa.addState(startLabel, isAcceptPair(a.startState, b.startState));

  const worklist: [string, string][] = [[a.startState, b.startState]];
  const seen = new Set<string>([startLabel]);

  while (worklist.length > 0) {
    const [sa, sb] = worklist.shift()!;
    const label = pairLabel(sa, sb);

    for (const sym of alphabet) {
      const rowA = a.transitions.get(sa);
      const rowB = b.transitions.get(sb);
      const ta = rowA?.get(sym) ?? null;
      const tb = rowB?.get(sym) ?? null;

      // If either automaton has no transition on this symbol, treat as a dead state.
      // We skip dead-state expansion for simplicity (reachable-only product).
      if (ta === null || tb === null) continue;

      const nextLabel = pairLabel(ta, tb);
      if (!seen.has(nextLabel)) {
        seen.add(nextLabel);
        dfa.addState(nextLabel, isAcceptPair(ta, tb));
        worklist.push([ta, tb]);
      }
      dfa.addTransition(label, sym, nextLabel);
    }
  }

  return dfa;
}

function pairLabel(a: string, b: string): string {
  return `(${a},${b})`;
}
