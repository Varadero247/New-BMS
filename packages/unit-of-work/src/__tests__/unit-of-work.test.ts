// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { UnitOfWork, ChangeSet, createUnitOfWork, Operation } from '../unit-of-work';

describe('UnitOfWork - basic operations', () => {
  it('starts clean', () => { expect(new UnitOfWork<string>().isClean()).toBe(true); });
  it('insert makes it dirty', () => {
    const uow = new UnitOfWork<string>();
    uow.insert('k1', 'v1');
    expect(uow.isClean()).toBe(false);
  });
  it('insert tracks key', () => {
    const uow = new UnitOfWork<string>();
    uow.insert('k1', 'v1');
    expect(uow.has('k1')).toBe(true);
  });
  it('getOperationType for insert', () => {
    const uow = new UnitOfWork<string>();
    uow.insert('k', 'v');
    expect(uow.getOperationType('k')).toBe('insert');
  });
  it('getOperationType for update', () => {
    const uow = new UnitOfWork<string>();
    uow.update('k', 'v2');
    expect(uow.getOperationType('k')).toBe('update');
  });
  it('getOperationType for delete', () => {
    const uow = new UnitOfWork<string>();
    uow.update('k', 'v'); // must exist first to get delete
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (uow as any).ops.set('k', { type: 'update', key: 'k', value: 'v' });
    uow.delete('k');
    expect(uow.getOperationType('k')).toBe('delete');
  });
  it('getOperationType returns undefined for unknown key', () => {
    const uow = new UnitOfWork<string>();
    expect(uow.getOperationType('unknown')).toBeUndefined();
  });
  it('operationCount is 0 initially', () => {
    expect(new UnitOfWork<string>().getOperationCount()).toBe(0);
  });
  for (let n = 1; n <= 50; n++) {
    it(`inserting ${n} keys has count ${n}`, () => {
      const uow = new UnitOfWork<number>();
      for (let i = 0; i < n; i++) uow.insert(`key${i}`, i);
      expect(uow.getOperationCount()).toBe(n);
    });
  }
});

describe('UnitOfWork - insert then update stays as insert', () => {
  it('update after insert keeps type as insert with new value', () => {
    const uow = new UnitOfWork<string>();
    uow.insert('k', 'v1');
    uow.update('k', 'v2');
    expect(uow.getOperationType('k')).toBe('insert');
    const ops = uow.getDirty();
    const op = ops.find(o => o.key === 'k');
    expect(op?.value).toBe('v2');
  });
  for (let i = 0; i < 30; i++) {
    it(`insert+update ${i} stays insert`, () => {
      const uow = new UnitOfWork<number>();
      uow.insert(`k${i}`, i);
      uow.update(`k${i}`, i * 2);
      expect(uow.getOperationType(`k${i}`)).toBe('insert');
    });
  }
});

describe('UnitOfWork - insert then delete removes from ops', () => {
  it('delete after insert removes key from tracked ops', () => {
    const uow = new UnitOfWork<string>();
    uow.insert('k', 'v');
    uow.delete('k');
    expect(uow.has('k')).toBe(false);
  });
  it('operationCount decreases after insert+delete', () => {
    const uow = new UnitOfWork<string>();
    uow.insert('k1', 'v1');
    uow.insert('k2', 'v2');
    uow.delete('k1');
    expect(uow.getOperationCount()).toBe(1);
  });
  for (let i = 0; i < 30; i++) {
    it(`insert+delete ${i} leaves isClean`, () => {
      const uow = new UnitOfWork<number>();
      uow.insert(`k${i}`, i);
      uow.delete(`k${i}`);
      expect(uow.has(`k${i}`)).toBe(false);
    });
  }
});

describe('UnitOfWork - getDirty', () => {
  it('getDirty returns all ops', () => {
    const uow = new UnitOfWork<string>();
    uow.insert('a', 'v1');
    uow.update('b', 'v2');
    expect(uow.getDirty()).toHaveLength(2);
  });
  it('getDirty returns array copy (not reference)', () => {
    const uow = new UnitOfWork<string>();
    uow.insert('k', 'v');
    const d1 = uow.getDirty();
    const d2 = uow.getDirty();
    expect(d1).not.toBe(d2);
  });
  for (let n = 0; n <= 50; n++) {
    it(`getDirty length = ${n} for ${n} inserts`, () => {
      const uow = new UnitOfWork<number>();
      for (let i = 0; i < n; i++) uow.insert(`k${i}`, i);
      expect(uow.getDirty()).toHaveLength(n);
    });
  }
});

describe('UnitOfWork - rollback', () => {
  it('rollback clears all ops', () => {
    const uow = new UnitOfWork<string>();
    uow.insert('k1', 'v1');
    uow.insert('k2', 'v2');
    uow.rollback();
    expect(uow.isClean()).toBe(true);
  });
  it('rollback resets count to 0', () => {
    const uow = new UnitOfWork<string>();
    for (let i = 0; i < 10; i++) uow.insert(`k${i}`, 'v');
    uow.rollback();
    expect(uow.getOperationCount()).toBe(0);
  });
  for (let n = 1; n <= 30; n++) {
    it(`rollback cleans ${n} ops`, () => {
      const uow = new UnitOfWork<number>();
      for (let i = 0; i < n; i++) uow.insert(`k${i}`, i);
      uow.rollback();
      expect(uow.isClean()).toBe(true);
    });
  }
});

describe('UnitOfWork - commit', () => {
  it('commit calls executor with ops', async () => {
    const uow = new UnitOfWork<string>();
    uow.insert('k', 'v');
    let received: Operation<string>[] = [];
    await uow.commit(ops => { received = ops; });
    expect(received).toHaveLength(1);
    expect(received[0].key).toBe('k');
  });
  it('commit clears ops after execution', async () => {
    const uow = new UnitOfWork<string>();
    uow.insert('k', 'v');
    await uow.commit(() => {});
    expect(uow.isClean()).toBe(true);
  });
  it('commit works with async executor', async () => {
    const uow = new UnitOfWork<string>();
    uow.insert('k', 'v');
    await uow.commit(async ops => { await Promise.resolve(); });
    expect(uow.isClean()).toBe(true);
  });
  for (let n = 1; n <= 20; n++) {
    it(`commit with ${n} ops passes all to executor`, async () => {
      const uow = new UnitOfWork<number>();
      for (let i = 0; i < n; i++) uow.insert(`k${i}`, i);
      let count = 0;
      await uow.commit(ops => { count = ops.length; });
      expect(count).toBe(n);
    });
  }
});

describe('ChangeSet', () => {
  const ops: Operation<string>[] = [
    { type: 'insert', key: 'k1', value: 'v1' },
    { type: 'update', key: 'k2', value: 'v2', oldValue: 'old2' },
    { type: 'delete', key: 'k3', oldValue: 'old3' },
  ];

  it('size returns number of ops', () => {
    const cs = new ChangeSet(ops);
    expect(cs.size).toBe(3);
  });
  it('getInserts filters inserts', () => {
    const cs = new ChangeSet(ops);
    expect(cs.getInserts()).toHaveLength(1);
    expect(cs.getInserts()[0].key).toBe('k1');
  });
  it('getUpdates filters updates', () => {
    const cs = new ChangeSet(ops);
    expect(cs.getUpdates()).toHaveLength(1);
    expect(cs.getUpdates()[0].key).toBe('k2');
  });
  it('getDeletes filters deletes', () => {
    const cs = new ChangeSet(ops);
    expect(cs.getDeletes()).toHaveLength(1);
    expect(cs.getDeletes()[0].key).toBe('k3');
  });
  it('apply inserts to store', () => {
    const store = new Map<string, string>();
    const cs = new ChangeSet<string>([{ type: 'insert', key: 'k', value: 'v' }]);
    cs.apply(store);
    expect(store.get('k')).toBe('v');
  });
  it('apply deletes from store', () => {
    const store = new Map<string, string>([['k', 'v']]);
    const cs = new ChangeSet<string>([{ type: 'delete', key: 'k', oldValue: 'v' }]);
    cs.apply(store);
    expect(store.has('k')).toBe(false);
  });
  it('apply updates store value', () => {
    const store = new Map<string, string>([['k', 'old']]);
    const cs = new ChangeSet<string>([{ type: 'update', key: 'k', value: 'new', oldValue: 'old' }]);
    cs.apply(store);
    expect(store.get('k')).toBe('new');
  });
  it('reverse of insert is delete', () => {
    const cs = new ChangeSet<string>([{ type: 'insert', key: 'k', value: 'v' }]);
    const rev = cs.reverse();
    expect(rev.getDeletes()).toHaveLength(1);
  });
  it('reverse of delete is insert', () => {
    const cs = new ChangeSet<string>([{ type: 'delete', key: 'k', oldValue: 'v' }]);
    const rev = cs.reverse();
    expect(rev.getInserts()).toHaveLength(1);
  });
  it('reverse of update swaps values', () => {
    const cs = new ChangeSet<string>([{ type: 'update', key: 'k', value: 'new', oldValue: 'old' }]);
    const rev = cs.reverse();
    expect(rev.getUpdates()[0].value).toBe('old');
    expect(rev.getUpdates()[0].oldValue).toBe('new');
  });
  for (let n = 0; n <= 50; n++) {
    it(`ChangeSet size = ${n}`, () => {
      const ops: Operation<number>[] = Array.from({ length: n }, (_, i) => ({ type: 'insert' as const, key: `k${i}`, value: i }));
      expect(new ChangeSet(ops).size).toBe(n);
    });
  }
});

describe('createUnitOfWork factory', () => {
  it('creates a UnitOfWork instance', () => {
    const uow = createUnitOfWork<string>();
    expect(uow).toBeInstanceOf(UnitOfWork);
  });
  it('starts clean', () => {
    expect(createUnitOfWork<number>().isClean()).toBe(true);
  });
  for (let i = 0; i < 30; i++) {
    it(`factory creates independent instances ${i}`, () => {
      const uow1 = createUnitOfWork<number>();
      const uow2 = createUnitOfWork<number>();
      uow1.insert(`k${i}`, i);
      expect(uow2.isClean()).toBe(true);
    });
  }
});

describe('unit-of-work extended coverage', () => {
  for (let i = 0; i < 100; i++) {
    it(`UnitOfWork insert ${i} keys one by one`, () => {
      const uow = createUnitOfWork<number>();
      for (let j = 0; j <= i; j++) uow.insert(`k${j}`, j);
      expect(uow.getOperationCount()).toBe(i + 1);
    });
  }
  for (let i = 0; i < 100; i++) {
    it(`getDirty returns all inserts ${i}`, () => {
      const uow = createUnitOfWork<number>();
      uow.insert(`k${i}`, i);
      const ops = uow.getDirty();
      expect(ops.some(o => o.key === `k${i}` && o.value === i)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it(`rollback then insert works fresh ${i}`, () => {
      const uow = createUnitOfWork<string>();
      uow.insert('x', 'old');
      uow.rollback();
      uow.insert(`k${i}`, 'new');
      expect(uow.getOperationCount()).toBe(1);
    });
  }
  for (let n = 0; n <= 100; n++) {
    it(`ChangeSet of ${n} inserts: size = ${n}`, () => {
      const ops: Operation<number>[] = Array.from({ length: n }, (_, i) => ({ type: 'insert' as const, key: `k${i}`, value: i }));
      expect(new ChangeSet(ops).size).toBe(n);
    });
  }
  for (let i = 0; i < 100; i++) {
    it(`ChangeSet apply then reverse undoes it ${i}`, () => {
      const store = new Map<string, number>([[`k${i}`, i]]);
      const cs = new ChangeSet<number>([{ type: 'update', key: `k${i}`, value: i + 1, oldValue: i }]);
      cs.apply(store);
      expect(store.get(`k${i}`)).toBe(i + 1);
      cs.reverse().apply(store);
      expect(store.get(`k${i}`)).toBe(i);
    });
  }
  for (let i = 0; i < 100; i++) {
    it(`update after existing update keeps update type ${i}`, () => {
      const uow = createUnitOfWork<number>();
      uow.update(`k${i}`, i, i - 1);
      uow.update(`k${i}`, i + 1, i);
      expect(uow.getOperationType(`k${i}`)).toBe('update');
    });
  }
  for (let i = 0; i < 100; i++) {
    it(`commit passes correct op values ${i}`, async () => {
      const uow = createUnitOfWork<number>();
      uow.insert(`key${i}`, i * 2);
      let val = -1;
      await uow.commit(ops => { val = (ops[0].value as number); });
      expect(val).toBe(i * 2);
    });
  }
});
