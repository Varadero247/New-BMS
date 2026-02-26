// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export type OperationType = 'insert' | 'update' | 'delete';

export interface Operation<T> {
  type: OperationType;
  key: string;
  value?: T;
  oldValue?: T;
}

export class UnitOfWork<T> {
  private ops = new Map<string, Operation<T>>();

  insert(key: string, value: T): void {
    this.ops.set(key, { type: 'insert', key, value });
  }

  update(key: string, value: T, oldValue?: T): void {
    const existing = this.ops.get(key);
    if (existing?.type === 'insert') {
      this.ops.set(key, { type: 'insert', key, value });
    } else {
      this.ops.set(key, { type: 'update', key, value, oldValue });
    }
  }

  delete(key: string, oldValue?: T): void {
    const existing = this.ops.get(key);
    if (existing?.type === 'insert') {
      this.ops.delete(key);
    } else {
      this.ops.set(key, { type: 'delete', key, oldValue });
    }
  }

  getDirty(): Operation<T>[] { return Array.from(this.ops.values()); }

  isClean(): boolean { return this.ops.size === 0; }

  has(key: string): boolean { return this.ops.has(key); }

  getOperationCount(): number { return this.ops.size; }

  getOperationType(key: string): OperationType | undefined { return this.ops.get(key)?.type; }

  async commit(executor: (ops: Operation<T>[]) => Promise<void> | void): Promise<void> {
    const ops = this.getDirty();
    await executor(ops);
    this.ops.clear();
  }

  rollback(): void { this.ops.clear(); }
}

export class ChangeSet<T> {
  private ops: Operation<T>[];

  constructor(ops: Operation<T>[]) { this.ops = [...ops]; }

  apply(store: Map<string, T>): void {
    for (const op of this.ops) {
      if (op.type === 'insert' || op.type === 'update') {
        if (op.value !== undefined) store.set(op.key, op.value);
      } else {
        store.delete(op.key);
      }
    }
  }

  reverse(): ChangeSet<T> {
    const reversed: Operation<T>[] = this.ops.map(op => {
      if (op.type === 'insert') return { type: 'delete' as const, key: op.key, oldValue: op.value };
      if (op.type === 'delete') return { type: 'insert' as const, key: op.key, value: op.oldValue };
      return { type: 'update' as const, key: op.key, value: op.oldValue, oldValue: op.value };
    }).reverse();
    return new ChangeSet<T>(reversed);
  }

  get size(): number { return this.ops.length; }

  getInserts(): Operation<T>[] { return this.ops.filter(o => o.type === 'insert'); }
  getUpdates(): Operation<T>[] { return this.ops.filter(o => o.type === 'update'); }
  getDeletes(): Operation<T>[] { return this.ops.filter(o => o.type === 'delete'); }
}

export function createUnitOfWork<T>(): UnitOfWork<T> { return new UnitOfWork<T>(); }
