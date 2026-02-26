// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ---------------------------------------------------------------------------
// KVStore interface
// ---------------------------------------------------------------------------

export interface KVStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  clear(): void;
  has(key: string): boolean;
  keys(): string[];
  length(): number;
}

// ---------------------------------------------------------------------------
// createMemoryStore
// ---------------------------------------------------------------------------

export function createMemoryStore(): KVStore {
  const data = new Map<string, string>();
  return {
    get(key: string): string | null {
      return data.has(key) ? (data.get(key) as string) : null;
    },
    set(key: string, value: string): void {
      data.set(key, value);
    },
    remove(key: string): void {
      data.delete(key);
    },
    clear(): void {
      data.clear();
    },
    has(key: string): boolean {
      return data.has(key);
    },
    keys(): string[] {
      return Array.from(data.keys());
    },
    length(): number {
      return data.size;
    },
  };
}

// ---------------------------------------------------------------------------
// createTypedStore
// ---------------------------------------------------------------------------

export function createTypedStore<T>(
  store: KVStore,
  key: string
): {
  get(): T | null;
  set(value: T): void;
  remove(): void;
  has(): boolean;
} {
  return {
    get(): T | null {
      const raw = store.get(key);
      if (raw === null) return null;
      return deserializeValue<T>(raw);
    },
    set(value: T): void {
      store.set(key, serializeValue(value));
    },
    remove(): void {
      store.remove(key);
    },
    has(): boolean {
      return store.has(key);
    },
  };
}

// ---------------------------------------------------------------------------
// createNamespacedStore
// ---------------------------------------------------------------------------

export function createNamespacedStore(store: KVStore, namespace: string): KVStore {
  const prefix = namespace.endsWith(':') ? namespace : namespace + ':';

  function namespacedKey(key: string): string {
    return prefix + key;
  }

  function stripNamespace(nsKey: string): string {
    return nsKey.slice(prefix.length);
  }

  return {
    get(key: string): string | null {
      return store.get(namespacedKey(key));
    },
    set(key: string, value: string): void {
      store.set(namespacedKey(key), value);
    },
    remove(key: string): void {
      store.remove(namespacedKey(key));
    },
    clear(): void {
      const nsKeys = store.keys().filter((k) => k.startsWith(prefix));
      for (const k of nsKeys) {
        store.remove(k);
      }
    },
    has(key: string): boolean {
      return store.has(namespacedKey(key));
    },
    keys(): string[] {
      return store
        .keys()
        .filter((k) => k.startsWith(prefix))
        .map(stripNamespace);
    },
    length(): number {
      return store.keys().filter((k) => k.startsWith(prefix)).length;
    },
  };
}

// ---------------------------------------------------------------------------
// serializeValue / deserializeValue
// ---------------------------------------------------------------------------

export function serializeValue(value: unknown): string {
  return JSON.stringify(value);
}

export function deserializeValue<T>(str: string): T | null {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Batch operations
// ---------------------------------------------------------------------------

export function getMany(store: KVStore, keys: string[]): (string | null)[] {
  return keys.map((k) => store.get(k));
}

export function setMany(store: KVStore, entries: [string, string][]): void {
  for (const [key, value] of entries) {
    store.set(key, value);
  }
}

export function removeMany(store: KVStore, keys: string[]): void {
  for (const key of keys) {
    store.remove(key);
  }
}

// ---------------------------------------------------------------------------
// Storage stats
// ---------------------------------------------------------------------------

export function getStorageSize(store: KVStore): number {
  const keys = store.keys();
  return keys.reduce((total, key) => {
    const value = store.get(key) ?? '';
    return total + key.length + value.length;
  }, 0);
}

export function getKeySize(store: KVStore, key: string): number {
  const value = store.get(key);
  if (value === null) return 0;
  return key.length + value.length;
}

// ---------------------------------------------------------------------------
// Filtered operations
// ---------------------------------------------------------------------------

export function getByPrefix(store: KVStore, prefix: string): [string, string][] {
  return store
    .keys()
    .filter((k) => k.startsWith(prefix))
    .map((k) => [k, store.get(k) as string]);
}

export function removeByPrefix(store: KVStore, prefix: string): number {
  const matching = store.keys().filter((k) => k.startsWith(prefix));
  for (const k of matching) {
    store.remove(k);
  }
  return matching.length;
}

export function getByPattern(store: KVStore, pattern: RegExp): [string, string][] {
  return store
    .keys()
    .filter((k) => pattern.test(k))
    .map((k) => [k, store.get(k) as string]);
}

// ---------------------------------------------------------------------------
// Migration / versioning
// ---------------------------------------------------------------------------

const VERSION_KEY = '__version__';

export function withVersion(
  store: KVStore,
  version: number
): KVStore & { getVersion(): number } {
  // Store the version immediately
  store.set(VERSION_KEY, String(version));

  const versioned: KVStore & { getVersion(): number } = {
    get(key: string): string | null {
      return store.get(key);
    },
    set(key: string, value: string): void {
      store.set(key, value);
    },
    remove(key: string): void {
      store.remove(key);
    },
    clear(): void {
      store.clear();
      // Restore version after clear
      store.set(VERSION_KEY, String(version));
    },
    has(key: string): boolean {
      return store.has(key);
    },
    keys(): string[] {
      return store.keys();
    },
    length(): number {
      return store.length();
    },
    getVersion(): number {
      const v = store.get(VERSION_KEY);
      return v !== null ? Number(v) : version;
    },
  };

  return versioned;
}
