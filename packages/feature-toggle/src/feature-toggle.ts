// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Types ───────────────────────────────────────────────────────────────────

export type RolloutStrategy = 'all' | 'none' | 'percentage' | 'userList' | 'group' | 'environment';

export interface ToggleRule {
  strategy: RolloutStrategy;
  percentage?: number;       // 0-100 for 'percentage'
  users?: string[];          // for 'userList'
  groups?: string[];         // for 'group'
  environments?: string[];   // for 'environment'
}

export interface Toggle {
  key: string;
  enabled: boolean;
  description?: string;
  rules?: ToggleRule[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ToggleContext {
  userId?: string;
  groupId?: string;
  environment?: string;
  attributes?: Record<string, string | number | boolean>;
}

// ─── djb2 hash (deterministic) ───────────────────────────────────────────────

function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  // Convert to unsigned 32-bit int
  return hash >>> 0;
}

// ─── Percentage rollout helper ────────────────────────────────────────────────

export function inRollout(userId: string, key: string, percentage: number): boolean {
  if (percentage <= 0) return false;
  if (percentage >= 100) return true;
  const h = djb2(userId + ':' + key);
  return (h % 100) < percentage;
}

// ─── FeatureToggleRegistry ────────────────────────────────────────────────────

export class FeatureToggleRegistry {
  private toggles: Map<string, Toggle>;

  constructor(initial?: Record<string, boolean | Toggle>) {
    this.toggles = new Map();
    if (initial) {
      for (const [key, val] of Object.entries(initial)) {
        if (typeof val === 'boolean') {
          this.define(key, val);
        } else {
          this.toggles.set(key, val);
        }
      }
    }
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  define(
    key: string,
    enabled: boolean,
    opts?: Partial<Omit<Toggle, 'key' | 'enabled' | 'createdAt' | 'updatedAt'>>,
  ): this {
    const now = new Date();
    const existing = this.toggles.get(key);
    this.toggles.set(key, {
      key,
      enabled,
      description: opts?.description,
      rules: opts?.rules,
      tags: opts?.tags,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    });
    return this;
  }

  enable(key: string): this {
    const t = this.toggles.get(key);
    if (t) {
      t.enabled = true;
      t.updatedAt = new Date();
    } else {
      this.define(key, true);
    }
    return this;
  }

  disable(key: string): this {
    const t = this.toggles.get(key);
    if (t) {
      t.enabled = false;
      t.updatedAt = new Date();
    } else {
      this.define(key, false);
    }
    return this;
  }

  delete(key: string): boolean {
    return this.toggles.delete(key);
  }

  exists(key: string): boolean {
    return this.toggles.has(key);
  }

  get(key: string): Toggle | undefined {
    return this.toggles.get(key);
  }

  list(): Toggle[] {
    return Array.from(this.toggles.values());
  }

  keys(): string[] {
    return Array.from(this.toggles.keys());
  }

  // ── Evaluation ────────────────────────────────────────────────────────────

  isEnabled(key: string, ctx?: ToggleContext): boolean {
    const toggle = this.toggles.get(key);
    if (!toggle || !toggle.enabled) return false;

    // If no rules, the toggle's enabled flag is the answer
    if (!toggle.rules || toggle.rules.length === 0) return true;

    // All rules must pass (AND semantics)
    for (const rule of toggle.rules) {
      if (!this._evalRule(rule, key, ctx)) return false;
    }
    return true;
  }

  private _evalRule(rule: ToggleRule, key: string, ctx?: ToggleContext): boolean {
    switch (rule.strategy) {
      case 'all':
        return true;
      case 'none':
        return false;
      case 'percentage': {
        const pct = rule.percentage ?? 0;
        const userId = ctx?.userId ?? '';
        return inRollout(userId, key, pct);
      }
      case 'userList': {
        const userId = ctx?.userId;
        if (!userId) return false;
        return (rule.users ?? []).includes(userId);
      }
      case 'group': {
        const groupId = ctx?.groupId;
        if (!groupId) return false;
        return (rule.groups ?? []).includes(groupId);
      }
      case 'environment': {
        const env = ctx?.environment;
        if (!env) return false;
        return (rule.environments ?? []).includes(env);
      }
      default:
        return false;
    }
  }

  // ── Bulk operations ───────────────────────────────────────────────────────

  enableAll(): this {
    for (const t of this.toggles.values()) {
      t.enabled = true;
      t.updatedAt = new Date();
    }
    return this;
  }

  disableAll(): this {
    for (const t of this.toggles.values()) {
      t.enabled = false;
      t.updatedAt = new Date();
    }
    return this;
  }

  reset(): this {
    this.toggles.clear();
    return this;
  }

  // ── Serialization ─────────────────────────────────────────────────────────

  toJSON(): Record<string, Toggle> {
    const out: Record<string, Toggle> = {};
    for (const [k, v] of this.toggles.entries()) {
      out[k] = v;
    }
    return out;
  }

  fromJSON(data: Record<string, Toggle>): this {
    for (const [k, v] of Object.entries(data)) {
      this.toggles.set(k, {
        ...v,
        createdAt: new Date(v.createdAt),
        updatedAt: new Date(v.updatedAt),
      });
    }
    return this;
  }

  // ── Filtering ─────────────────────────────────────────────────────────────

  byTag(tag: string): Toggle[] {
    return this.list().filter(t => t.tags?.includes(tag));
  }

  byEnvironment(env: string): Toggle[] {
    return this.list().filter(t =>
      t.rules?.some(r => r.strategy === 'environment' && (r.environments ?? []).includes(env)),
    );
  }

  search(query: string): Toggle[] {
    const q = query.toLowerCase();
    return this.list().filter(
      t => t.key.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q),
    );
  }
}

// ─── Module-level singleton ───────────────────────────────────────────────────

export const registry = new FeatureToggleRegistry();

export function define(key: string, enabled: boolean): void {
  registry.define(key, enabled);
}

export function enable(key: string): void {
  registry.enable(key);
}

export function disable(key: string): void {
  registry.disable(key);
}

export function isEnabled(key: string, ctx?: ToggleContext): boolean {
  return registry.isEnabled(key, ctx);
}

export function listToggles(): Toggle[] {
  return registry.list();
}

// ─── Guard ────────────────────────────────────────────────────────────────────

export function guard<T>(
  key: string,
  fn: () => T,
  fallback?: () => T,
  ctx?: ToggleContext,
): T | undefined {
  if (registry.isEnabled(key, ctx)) {
    return fn();
  }
  return fallback ? fallback() : undefined;
}

// ─── Decorator factory ────────────────────────────────────────────────────────

export function requireToggle(key: string, ctx?: ToggleContext): MethodDecorator {
  return function (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const original = descriptor.value as (...args: unknown[]) => unknown;
    descriptor.value = function (...args: unknown[]): unknown {
      if (!registry.isEnabled(key, ctx)) {
        return undefined;
      }
      return original.apply(this, args);
    };
    return descriptor;
  };
}

// ─── Experiments (A/B) ───────────────────────────────────────────────────────

export type Variant = 'control' | 'treatment' | string;

export interface Experiment {
  key: string;
  variants: Variant[];
  weights: number[];  // must sum to 100
}

const experiments = new Map<string, Experiment>();

export function defineExperiment(exp: Experiment): void {
  experiments.set(exp.key, exp);
}

export function getVariant(experimentKey: string, userId: string): Variant {
  const exp = experiments.get(experimentKey);
  if (!exp || exp.variants.length === 0) return 'control';

  const h = djb2(userId + experimentKey);
  const bucket = h % 100;

  let cumulative = 0;
  for (let i = 0; i < exp.variants.length; i++) {
    cumulative += exp.weights[i] ?? 0;
    if (bucket < cumulative) return exp.variants[i];
  }
  // Fallback to last variant
  return exp.variants[exp.variants.length - 1];
}

// ─── Snapshot ─────────────────────────────────────────────────────────────────

export function snapshot(): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const toggle of registry.list()) {
    result[toggle.key] = toggle.enabled;
  }
  return result;
}

// ─── Diff ─────────────────────────────────────────────────────────────────────

export function diffSnapshots(
  a: Record<string, boolean>,
  b: Record<string, boolean>,
): { added: string[]; removed: string[]; changed: string[] } {
  const aKeys = new Set(Object.keys(a));
  const bKeys = new Set(Object.keys(b));

  const added = [...bKeys].filter(k => !aKeys.has(k));
  const removed = [...aKeys].filter(k => !bKeys.has(k));
  const changed = [...aKeys].filter(k => bKeys.has(k) && a[k] !== b[k]);

  return { added, removed, changed };
}
