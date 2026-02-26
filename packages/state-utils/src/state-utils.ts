// Copyright (c) 2026 Nexara DMCC. All rights reserved.

/** Simple reactive store */
export interface Store<T> {
  getState(): T;
  setState(updater: T | ((prev: T) => T)): void;
  subscribe(listener: (state: T) => void): () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<(s: T) => void>();
  return {
    getState: () => state,
    setState(updater) {
      state = typeof updater === 'function' ? (updater as (p: T) => T)(state) : updater;
      listeners.forEach(l => l(state));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** Immutable helpers */
export function set<T extends object>(obj: T, key: keyof T, value: T[keyof T]): T {
  return { ...obj, [key]: value };
}

export function setIn<T extends object>(obj: T, path: string[], value: unknown): T {
  if (path.length === 0) return obj;
  if (path.length === 1) return { ...obj, [path[0]]: value } as T;
  const key = path[0] as keyof T;
  return { ...obj, [key]: setIn((obj[key] as object) ?? {}, path.slice(1), value) } as T;
}

export function getIn(obj: unknown, path: string[]): unknown {
  let current = obj as Record<string, unknown>;
  for (const key of path) {
    if (current == null) return undefined;
    current = current[key] as Record<string, unknown>;
  }
  return current;
}

export function deleteKey<T extends object>(obj: T, key: keyof T): Omit<T, typeof key> {
  const result = { ...obj };
  delete result[key];
  return result;
}

export function merge<T extends object>(a: T, b: Partial<T>): T {
  return { ...a, ...b };
}

export function produce<T>(base: T, recipe: (draft: T) => void): T {
  const draft = JSON.parse(JSON.stringify(base)) as T;
  recipe(draft);
  return draft;
}

/** Selectors */
export function createSelector<T, R>(selector: (state: T) => R): (state: T) => R {
  let lastState: T;
  let lastResult: R;
  return (state: T) => {
    if (state === lastState) return lastResult;
    lastState = state;
    lastResult = selector(state);
    return lastResult;
  };
}

export function createComputedSelector<T, A, R>(
  selectorA: (state: T) => A,
  combiner: (a: A) => R
): (state: T) => R {
  let lastA: A;
  let lastResult: R;
  return (state: T) => {
    const a = selectorA(state);
    if (a === lastA) return lastResult;
    lastA = a;
    lastResult = combiner(a);
    return lastResult;
  };
}

/** Simple state machine */
export interface StateMachineConfig<S extends string, E extends string> {
  initial: S;
  transitions: { from: S; event: E; to: S }[];
}

export interface StateMachine<S extends string, E extends string> {
  current: S;
  send(event: E): StateMachine<S, E>;
  can(event: E): boolean;
}

export function createStateMachine<S extends string, E extends string>(
  config: StateMachineConfig<S, E>
): StateMachine<S, E> {
  return {
    current: config.initial,
    send(event: E) {
      const t = config.transitions.find(t => t.from === this.current && t.event === event);
      if (!t) return this;
      return { ...this, current: t.to };
    },
    can(event: E) {
      return config.transitions.some(t => t.from === this.current && t.event === event);
    },
  };
}

/** Undo/redo history */
export interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

export function createHistory<T>(initial: T): History<T> {
  return { past: [], present: initial, future: [] };
}

export function pushHistory<T>(h: History<T>, next: T): History<T> {
  return { past: [...h.past, h.present], present: next, future: [] };
}

export function undoHistory<T>(h: History<T>): History<T> {
  if (h.past.length === 0) return h;
  const past = h.past.slice(0, -1);
  const present = h.past[h.past.length - 1];
  return { past, present, future: [h.present, ...h.future] };
}

export function redoHistory<T>(h: History<T>): History<T> {
  if (h.future.length === 0) return h;
  const [present, ...future] = h.future;
  return { past: [...h.past, h.present], present, future };
}

export function canUndo<T>(h: History<T>): boolean { return h.past.length > 0; }
export function canRedo<T>(h: History<T>): boolean { return h.future.length > 0; }
