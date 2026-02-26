// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ─── Token ───────────────────────────────────────────────────────────────────

/**
 * A nominal type-safe token used to identify a dependency.
 * At runtime it is a plain Symbol.
 */
export type Token<T> = symbol & { readonly _type: T };

/**
 * Create a new unique token for type T.
 * @param name - Human-readable label (used in Symbol description).
 */
export function createToken<T>(name: string): Token<T> {
  return Symbol(name) as Token<T>;
}

// ─── Registration record ─────────────────────────────────────────────────────

type Registration<T> =
  | { kind: 'factory'; factory: () => T }
  | { kind: 'singleton'; factory: () => T; instance?: T; resolved: boolean }
  | { kind: 'value'; value: T };

// ─── Container ───────────────────────────────────────────────────────────────

export interface Container {
  /** Register a transient factory — a new instance is created on each resolve. */
  register<T>(token: Token<T>, factory: () => T): this;
  /** Register a singleton factory — the same instance is returned on every resolve. */
  registerSingleton<T>(token: Token<T>, factory: () => T): this;
  /** Register a pre-existing value. */
  registerValue<T>(token: Token<T>, value: T): this;
  /** Resolve the dependency for the given token. Throws if not registered. */
  resolve<T>(token: Token<T>): T;
  /** Return true if the token is registered in this container or any ancestor. */
  has<T>(token: Token<T>): boolean;
  /** Create a child container that inherits registrations from this container. */
  child(): Container;
  /** Remove all registrations from this container. */
  reset(): void;
}

class ContainerImpl implements Container {
  private readonly _registry = new Map<symbol, Registration<unknown>>();
  private readonly _parent: ContainerImpl | null;

  constructor(parent: ContainerImpl | null = null) {
    this._parent = parent;
  }

  register<T>(token: Token<T>, factory: () => T): this {
    this._registry.set(token as symbol, { kind: 'factory', factory: factory as () => unknown });
    return this;
  }

  registerSingleton<T>(token: Token<T>, factory: () => T): this {
    this._registry.set(token as symbol, {
      kind: 'singleton',
      factory: factory as () => unknown,
      resolved: false,
    });
    return this;
  }

  registerValue<T>(token: Token<T>, value: T): this {
    this._registry.set(token as symbol, { kind: 'value', value: value as unknown });
    return this;
  }

  resolve<T>(token: Token<T>): T {
    const reg = this._registry.get(token as symbol);
    if (reg !== undefined) {
      return this._resolveRegistration<T>(reg as Registration<T>);
    }
    if (this._parent !== null) {
      return this._parent.resolve(token);
    }
    throw new Error(
      `Token "${String(token)} (${(token as symbol).description ?? 'unknown'})" is not registered.`,
    );
  }

  private _resolveRegistration<T>(reg: Registration<T>): T {
    if (reg.kind === 'value') {
      return reg.value;
    }
    if (reg.kind === 'factory') {
      return reg.factory();
    }
    // singleton
    if (!reg.resolved) {
      reg.instance = reg.factory();
      reg.resolved = true;
    }
    return reg.instance as T;
  }

  has<T>(token: Token<T>): boolean {
    if (this._registry.has(token as symbol)) return true;
    if (this._parent !== null) return this._parent.has(token);
    return false;
  }

  child(): Container {
    return new ContainerImpl(this);
  }

  reset(): void {
    this._registry.clear();
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/** Create a new, empty dependency-injection container. */
export function createContainer(): Container {
  return new ContainerImpl();
}

// ─── Utility helpers ─────────────────────────────────────────────────────────

/** Resolve a dependency from the container (alias for container.resolve). */
export function inject<T>(container: Container, token: Token<T>): T {
  return container.resolve(token);
}

/** Return true if the token is registered in the container (alias for container.has). */
export function isRegistered<T>(container: Container, token: Token<T>): boolean {
  return container.has(token);
}

// ─── Scope ───────────────────────────────────────────────────────────────────

/**
 * Create a child scope, run the factory with that scoped container, and return
 * the result. Useful for request-scoped or unit-of-work patterns.
 */
export function createScope<T>(container: Container, factory: (c: Container) => T): T {
  const scope = container.child();
  return factory(scope);
}
