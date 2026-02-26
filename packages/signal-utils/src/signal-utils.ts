// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export type Signal<T> = { get(): T; set(v: T): void; };
export type Computed<T> = { get(): T; };
export type Effect = { dispose(): void; };

type Subscriber = () => void;

let currentEffect: Subscriber | null = null;

export function createSignal<T>(initial: T): Signal<T> {
  let value = initial;
  const subs = new Set<Subscriber>();
  return {
    get() {
      if (currentEffect) subs.add(currentEffect);
      return value;
    },
    set(v: T) {
      value = v;
      subs.forEach(s => s());
    }
  };
}

export function createComputed<T>(fn: () => T): Computed<T> {
  let cached: T;
  let dirty = true;
  const subs = new Set<Subscriber>();
  const self: Subscriber = () => { dirty = true; subs.forEach(s => s()); };
  return {
    get() {
      if (dirty) {
        const prev = currentEffect;
        currentEffect = self;
        cached = fn();
        currentEffect = prev;
        dirty = false;
      }
      if (currentEffect) subs.add(currentEffect);
      return cached;
    }
  };
}

export function createEffect(fn: () => void): Effect {
  const sub: Subscriber = () => {
    const prev = currentEffect;
    currentEffect = sub;
    fn();
    currentEffect = prev;
  };
  sub();
  return { dispose() { /* unsubscribe */ } };
}

export function batch(fn: () => void): void { fn(); }
export function untrack<T>(fn: () => T): T {
  const prev = currentEffect;
  currentEffect = null;
  const v = fn();
  currentEffect = prev;
  return v;
}
export function createMemo<T>(fn: () => T): () => T {
  const computed = createComputed(fn);
  return () => computed.get();
}
export function isSignal<T>(v: unknown): v is Signal<T> {
  return typeof v === 'object' && v !== null && 'get' in v && 'set' in v;
}
export function peek<T>(signal: Signal<T>): T { return untrack(() => signal.get()); }
export function derive<T, U>(signal: Signal<T>, fn: (v: T) => U): Computed<U> {
  return createComputed(() => fn(signal.get()));
}
