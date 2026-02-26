// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// @ims/builder-pattern — Fluent builder pattern utilities

// ─── Generic Object Builder ────────────────────────────────────────────────

export interface Builder<T> {
  set<K extends keyof T>(key: K, value: T[K]): this;
  setMany(partial: Partial<T>): this;
  build(): T;
  reset(): this;
  clone(): Builder<T>;
  getField<K extends keyof T>(key: K): T[K] | undefined;
  hasField<K extends keyof T>(key: K): boolean;
}

export function createBuilder<T>(defaults?: Partial<T>): Builder<T> {
  let state: Partial<T> = defaults ? { ...defaults } : {};
  const initial: Partial<T> = defaults ? { ...defaults } : {};

  const builder: Builder<T> = {
    set<K extends keyof T>(key: K, value: T[K]): typeof builder {
      state = { ...state, [key]: value };
      return builder;
    },
    setMany(partial: Partial<T>): typeof builder {
      state = { ...state, ...partial };
      return builder;
    },
    build(): T {
      return { ...state } as T;
    },
    reset(): typeof builder {
      state = { ...initial };
      return builder;
    },
    clone(): Builder<T> {
      return createBuilder<T>({ ...state } as Partial<T>);
    },
    getField<K extends keyof T>(key: K): T[K] | undefined {
      return state[key] as T[K] | undefined;
    },
    hasField<K extends keyof T>(key: K): boolean {
      return key in state && state[key] !== undefined;
    },
  };

  return builder;
}

// ─── URL Builder ───────────────────────────────────────────────────────────

export interface UrlBuilder {
  scheme(s: string): this;
  host(h: string): this;
  port(p: number): this;
  path(...segments: string[]): this;
  param(key: string, value: string): this;
  fragment(f: string): this;
  build(): string;
}

export function createUrlBuilder(): UrlBuilder {
  let _scheme = 'https';
  let _host = '';
  let _port: number | null = null;
  let _segments: string[] = [];
  let _params: Array<[string, string]> = [];
  let _fragment = '';

  const builder: UrlBuilder = {
    scheme(s: string): typeof builder {
      _scheme = s;
      return builder;
    },
    host(h: string): typeof builder {
      _host = h;
      return builder;
    },
    port(p: number): typeof builder {
      _port = p;
      return builder;
    },
    path(...segments: string[]): typeof builder {
      for (const seg of segments) {
        const clean = seg.replace(/^\/+|\/+$/g, '');
        if (clean) _segments.push(clean);
      }
      return builder;
    },
    param(key: string, value: string): typeof builder {
      _params.push([key, value]);
      return builder;
    },
    fragment(f: string): typeof builder {
      _fragment = f;
      return builder;
    },
    build(): string {
      let url = `${_scheme}://${_host}`;
      if (_port !== null) url += `:${_port}`;
      if (_segments.length > 0) url += `/${_segments.join('/')}`;
      if (_params.length > 0) {
        const qs = _params.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
        url += `?${qs}`;
      }
      if (_fragment) url += `#${_fragment}`;
      return url;
    },
  };

  return builder;
}

// ─── Query Builder ─────────────────────────────────────────────────────────

export interface QueryBuilder {
  from(table: string): this;
  select(...fields: string[]): this;
  where(condition: string): this;
  orderBy(field: string, direction?: 'ASC' | 'DESC'): this;
  limit(n: number): this;
  offset(n: number): this;
  build(): string;
}

export function createQueryBuilder(): QueryBuilder {
  let _table = '';
  let _fields: string[] = [];
  let _conditions: string[] = [];
  let _orderBy: Array<{ field: string; dir: 'ASC' | 'DESC' }> = [];
  let _limit: number | null = null;
  let _offset: number | null = null;

  const builder: QueryBuilder = {
    from(table: string): typeof builder {
      _table = table;
      return builder;
    },
    select(...fields: string[]): typeof builder {
      _fields.push(...fields);
      return builder;
    },
    where(condition: string): typeof builder {
      _conditions.push(condition);
      return builder;
    },
    orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): typeof builder {
      _orderBy.push({ field, dir: direction });
      return builder;
    },
    limit(n: number): typeof builder {
      _limit = n;
      return builder;
    },
    offset(n: number): typeof builder {
      _offset = n;
      return builder;
    },
    build(): string {
      const cols = _fields.length > 0 ? _fields.join(', ') : '*';
      let sql = `SELECT ${cols} FROM ${_table}`;
      if (_conditions.length > 0) sql += ` WHERE ${_conditions.join(' AND ')}`;
      if (_orderBy.length > 0) {
        const ord = _orderBy.map((o) => `${o.field} ${o.dir}`).join(', ');
        sql += ` ORDER BY ${ord}`;
      }
      if (_limit !== null) sql += ` LIMIT ${_limit}`;
      if (_offset !== null) sql += ` OFFSET ${_offset}`;
      return sql;
    },
  };

  return builder;
}

// ─── HTML Element Builder ──────────────────────────────────────────────────

export interface ElementBuilder {
  tag(name: string): this;
  attr(key: string, value: string): this;
  class_(...names: string[]): this;
  text(content: string): this;
  child(html: string): this;
  build(): string;
}

export function createElementBuilder(): ElementBuilder {
  let _tag = 'div';
  let _attrs: Array<[string, string]> = [];
  let _classes: string[] = [];
  let _children: string[] = [];

  const builder: ElementBuilder = {
    tag(name: string): typeof builder {
      _tag = name;
      return builder;
    },
    attr(key: string, value: string): typeof builder {
      _attrs.push([key, value]);
      return builder;
    },
    class_(...names: string[]): typeof builder {
      _classes.push(...names);
      return builder;
    },
    text(content: string): typeof builder {
      _children.push(content);
      return builder;
    },
    child(html: string): typeof builder {
      _children.push(html);
      return builder;
    },
    build(): string {
      let attrStr = '';
      if (_classes.length > 0) {
        attrStr += ` class="${_classes.join(' ')}"`;
      }
      for (const [k, v] of _attrs) {
        attrStr += ` ${k}="${v}"`;
      }
      const inner = _children.join('');
      return `<${_tag}${attrStr}>${inner}</${_tag}>`;
    },
  };

  return builder;
}
