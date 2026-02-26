// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ─── Types ────────────────────────────────────────────────────────────────────

export type StateNode<S extends string> = {
  id: S;
  final?: boolean;
};

export type Transition<S extends string, E extends string> = {
  from: S;
  event: E;
  to: S;
  guard?: (context: unknown) => boolean;
  action?: (context: unknown) => unknown;
};

export interface FSMConfig<S extends string, E extends string> {
  initial: S;
  states: S[];
  transitions: Transition<S, E>[];
  final?: S[];
}

export interface FSM<S extends string, E extends string> {
  current: S;
  send(event: E, context?: unknown): FSM<S, E>;
  can(event: E, context?: unknown): boolean;
  isIn(state: S): boolean;
  isFinal(): boolean;
  matches(state: S): boolean;
  history(): S[];
  reset(): FSM<S, E>;
}

// ─── createFSM ────────────────────────────────────────────────────────────────

export function createFSM<S extends string, E extends string>(
  config: FSMConfig<S, E>
): FSM<S, E> {
  if (!config.states.includes(config.initial)) {
    throw new Error(`Initial state "${config.initial}" is not listed in states.`);
  }

  let _current: S = config.initial;
  const _history: S[] = [config.initial];
  const _finalStates = new Set<S>(config.final ?? []);

  const fsm: FSM<S, E> = {
    get current() {
      return _current;
    },

    send(event: E, context?: unknown): FSM<S, E> {
      const match = config.transitions.find(
        (t) =>
          t.from === _current &&
          t.event === event &&
          (t.guard == null || t.guard(context))
      );
      if (!match) return fsm;
      if (match.action) match.action(context);
      _current = match.to;
      _history.push(_current);
      return fsm;
    },

    can(event: E, context?: unknown): boolean {
      return config.transitions.some(
        (t) =>
          t.from === _current &&
          t.event === event &&
          (t.guard == null || t.guard(context))
      );
    },

    isIn(state: S): boolean {
      return _current === state;
    },

    isFinal(): boolean {
      return _finalStates.has(_current);
    },

    matches(state: S): boolean {
      return _current === state;
    },

    history(): S[] {
      return [..._history];
    },

    reset(): FSM<S, E> {
      _current = config.initial;
      _history.length = 0;
      _history.push(config.initial);
      return fsm;
    },
  };

  return fsm;
}

// ─── Utility functions ────────────────────────────────────────────────────────

export function getReachableStates<S extends string, E extends string>(
  config: FSMConfig<S, E>,
  from?: S
): S[] {
  const start = from ?? config.initial;
  const visited = new Set<S>();
  const queue: S[] = [start];
  while (queue.length > 0) {
    const state = queue.shift()!;
    if (visited.has(state)) continue;
    visited.add(state);
    for (const t of config.transitions) {
      if (t.from === state && !visited.has(t.to)) {
        queue.push(t.to);
      }
    }
  }
  return [...visited];
}

export function hasPath<S extends string, E extends string>(
  config: FSMConfig<S, E>,
  from: S,
  to: S
): boolean {
  if (from === to) return true;
  const reachable = getReachableStates(config, from);
  return reachable.includes(to);
}

export function getTransitionsFrom<S extends string, E extends string>(
  config: FSMConfig<S, E>,
  state: S
): Transition<S, E>[] {
  return config.transitions.filter((t) => t.from === state);
}

export function getTransitionsTo<S extends string, E extends string>(
  config: FSMConfig<S, E>,
  state: S
): Transition<S, E>[] {
  return config.transitions.filter((t) => t.to === state);
}

export function validateFSM<S extends string, E extends string>(
  config: FSMConfig<S, E>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const stateSet = new Set(config.states);

  if (!stateSet.has(config.initial)) {
    errors.push(`Initial state "${config.initial}" not in states list.`);
  }

  for (const t of config.transitions) {
    if (!stateSet.has(t.from)) {
      errors.push(`Transition from unknown state "${t.from}".`);
    }
    if (!stateSet.has(t.to)) {
      errors.push(`Transition to unknown state "${t.to}".`);
    }
  }

  if (config.final) {
    for (const s of config.final) {
      if (!stateSet.has(s)) {
        errors.push(`Final state "${s}" not in states list.`);
      }
    }
  }

  if (config.states.length === 0) {
    errors.push("States list must not be empty.");
  }

  return { valid: errors.length === 0, errors };
}

export function serializeFSM<S extends string, E extends string>(
  fsm: FSM<S, E>
): { current: S; history: S[] } {
  return { current: fsm.current, history: fsm.history() };
}
