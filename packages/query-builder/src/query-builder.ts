// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export class Query<T> {
  private data: T[];

  constructor(data: T[]) {
    this.data = [...data];
  }

  where(pred: (t: T) => boolean): Query<T> {
    return new Query(this.data.filter(pred));
  }

  filter(pred: (t: T) => boolean): Query<T> {
    return this.where(pred);
  }

  select<K extends keyof T>(...keys: K[]): Query<Pick<T, K>> {
    return new Query(
      this.data.map(item => {
        const result = {} as Pick<T, K>;
        for (const key of keys) result[key] = item[key];
        return result;
      })
    );
  }

  orderBy(key: keyof T, dir: 'asc' | 'desc' = 'asc'): Query<T> {
    const sorted = [...this.data].sort((a, b) => {
      const av = a[key] as unknown as number;
      const bv = b[key] as unknown as number;
      return dir === 'asc' ? (av > bv ? 1 : av < bv ? -1 : 0) : (av < bv ? 1 : av > bv ? -1 : 0);
    });
    return new Query(sorted);
  }

  limit(n: number): Query<T> {
    return new Query(this.data.slice(0, n));
  }

  offset(n: number): Query<T> {
    return new Query(this.data.slice(n));
  }

  distinct(key?: keyof T): Query<T> {
    if (key === undefined) {
      return new Query([...new Set(this.data)]);
    }
    const seen = new Set();
    return new Query(this.data.filter(item => {
      const v = item[key];
      if (seen.has(v)) return false;
      seen.add(v);
      return true;
    }));
  }

  count(): number {
    return this.data.length;
  }

  sum(key: keyof T): number {
    return this.data.reduce((acc, item) => acc + (item[key] as unknown as number), 0);
  }

  avg(key: keyof T): number {
    if (this.data.length === 0) return 0;
    return this.sum(key) / this.data.length;
  }

  min(key: keyof T): number {
    if (this.data.length === 0) return NaN;
    return this.data.reduce((m, item) => {
      const v = item[key] as unknown as number;
      return v < m ? v : m;
    }, this.data[0][key] as unknown as number);
  }

  max(key: keyof T): number {
    if (this.data.length === 0) return NaN;
    return this.data.reduce((m, item) => {
      const v = item[key] as unknown as number;
      return v > m ? v : m;
    }, this.data[0][key] as unknown as number);
  }

  first(): T | undefined {
    return this.data[0];
  }

  last(): T | undefined {
    return this.data[this.data.length - 1];
  }

  toArray(): T[] {
    return [...this.data];
  }

  groupBy(key: keyof T): Map<T[keyof T], T[]> {
    const map = new Map<T[keyof T], T[]>();
    for (const item of this.data) {
      const k = item[key];
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(item);
    }
    return map;
  }
}

export function from<T>(data: T[]): Query<T> {
  return new Query<T>(data);
}
