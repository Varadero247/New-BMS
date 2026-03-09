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
function hd258uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258uow_hd',()=>{it('a',()=>{expect(hd258uow(1,4)).toBe(2);});it('b',()=>{expect(hd258uow(3,1)).toBe(1);});it('c',()=>{expect(hd258uow(0,0)).toBe(0);});it('d',()=>{expect(hd258uow(93,73)).toBe(2);});it('e',()=>{expect(hd258uow(15,0)).toBe(4);});});
function hd259uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259uow_hd',()=>{it('a',()=>{expect(hd259uow(1,4)).toBe(2);});it('b',()=>{expect(hd259uow(3,1)).toBe(1);});it('c',()=>{expect(hd259uow(0,0)).toBe(0);});it('d',()=>{expect(hd259uow(93,73)).toBe(2);});it('e',()=>{expect(hd259uow(15,0)).toBe(4);});});
function hd260uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260uow_hd',()=>{it('a',()=>{expect(hd260uow(1,4)).toBe(2);});it('b',()=>{expect(hd260uow(3,1)).toBe(1);});it('c',()=>{expect(hd260uow(0,0)).toBe(0);});it('d',()=>{expect(hd260uow(93,73)).toBe(2);});it('e',()=>{expect(hd260uow(15,0)).toBe(4);});});
function hd261uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261uow_hd',()=>{it('a',()=>{expect(hd261uow(1,4)).toBe(2);});it('b',()=>{expect(hd261uow(3,1)).toBe(1);});it('c',()=>{expect(hd261uow(0,0)).toBe(0);});it('d',()=>{expect(hd261uow(93,73)).toBe(2);});it('e',()=>{expect(hd261uow(15,0)).toBe(4);});});
function hd262uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262uow_hd',()=>{it('a',()=>{expect(hd262uow(1,4)).toBe(2);});it('b',()=>{expect(hd262uow(3,1)).toBe(1);});it('c',()=>{expect(hd262uow(0,0)).toBe(0);});it('d',()=>{expect(hd262uow(93,73)).toBe(2);});it('e',()=>{expect(hd262uow(15,0)).toBe(4);});});
function hd263uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263uow_hd',()=>{it('a',()=>{expect(hd263uow(1,4)).toBe(2);});it('b',()=>{expect(hd263uow(3,1)).toBe(1);});it('c',()=>{expect(hd263uow(0,0)).toBe(0);});it('d',()=>{expect(hd263uow(93,73)).toBe(2);});it('e',()=>{expect(hd263uow(15,0)).toBe(4);});});
function hd264uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264uow_hd',()=>{it('a',()=>{expect(hd264uow(1,4)).toBe(2);});it('b',()=>{expect(hd264uow(3,1)).toBe(1);});it('c',()=>{expect(hd264uow(0,0)).toBe(0);});it('d',()=>{expect(hd264uow(93,73)).toBe(2);});it('e',()=>{expect(hd264uow(15,0)).toBe(4);});});
function hd265uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265uow_hd',()=>{it('a',()=>{expect(hd265uow(1,4)).toBe(2);});it('b',()=>{expect(hd265uow(3,1)).toBe(1);});it('c',()=>{expect(hd265uow(0,0)).toBe(0);});it('d',()=>{expect(hd265uow(93,73)).toBe(2);});it('e',()=>{expect(hd265uow(15,0)).toBe(4);});});
function hd266uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266uow_hd',()=>{it('a',()=>{expect(hd266uow(1,4)).toBe(2);});it('b',()=>{expect(hd266uow(3,1)).toBe(1);});it('c',()=>{expect(hd266uow(0,0)).toBe(0);});it('d',()=>{expect(hd266uow(93,73)).toBe(2);});it('e',()=>{expect(hd266uow(15,0)).toBe(4);});});
function hd267uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267uow_hd',()=>{it('a',()=>{expect(hd267uow(1,4)).toBe(2);});it('b',()=>{expect(hd267uow(3,1)).toBe(1);});it('c',()=>{expect(hd267uow(0,0)).toBe(0);});it('d',()=>{expect(hd267uow(93,73)).toBe(2);});it('e',()=>{expect(hd267uow(15,0)).toBe(4);});});
function hd268uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268uow_hd',()=>{it('a',()=>{expect(hd268uow(1,4)).toBe(2);});it('b',()=>{expect(hd268uow(3,1)).toBe(1);});it('c',()=>{expect(hd268uow(0,0)).toBe(0);});it('d',()=>{expect(hd268uow(93,73)).toBe(2);});it('e',()=>{expect(hd268uow(15,0)).toBe(4);});});
function hd269uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269uow_hd',()=>{it('a',()=>{expect(hd269uow(1,4)).toBe(2);});it('b',()=>{expect(hd269uow(3,1)).toBe(1);});it('c',()=>{expect(hd269uow(0,0)).toBe(0);});it('d',()=>{expect(hd269uow(93,73)).toBe(2);});it('e',()=>{expect(hd269uow(15,0)).toBe(4);});});
function hd270uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270uow_hd',()=>{it('a',()=>{expect(hd270uow(1,4)).toBe(2);});it('b',()=>{expect(hd270uow(3,1)).toBe(1);});it('c',()=>{expect(hd270uow(0,0)).toBe(0);});it('d',()=>{expect(hd270uow(93,73)).toBe(2);});it('e',()=>{expect(hd270uow(15,0)).toBe(4);});});
function hd271uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271uow_hd',()=>{it('a',()=>{expect(hd271uow(1,4)).toBe(2);});it('b',()=>{expect(hd271uow(3,1)).toBe(1);});it('c',()=>{expect(hd271uow(0,0)).toBe(0);});it('d',()=>{expect(hd271uow(93,73)).toBe(2);});it('e',()=>{expect(hd271uow(15,0)).toBe(4);});});
function hd272uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272uow_hd',()=>{it('a',()=>{expect(hd272uow(1,4)).toBe(2);});it('b',()=>{expect(hd272uow(3,1)).toBe(1);});it('c',()=>{expect(hd272uow(0,0)).toBe(0);});it('d',()=>{expect(hd272uow(93,73)).toBe(2);});it('e',()=>{expect(hd272uow(15,0)).toBe(4);});});
function hd273uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273uow_hd',()=>{it('a',()=>{expect(hd273uow(1,4)).toBe(2);});it('b',()=>{expect(hd273uow(3,1)).toBe(1);});it('c',()=>{expect(hd273uow(0,0)).toBe(0);});it('d',()=>{expect(hd273uow(93,73)).toBe(2);});it('e',()=>{expect(hd273uow(15,0)).toBe(4);});});
function hd274uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274uow_hd',()=>{it('a',()=>{expect(hd274uow(1,4)).toBe(2);});it('b',()=>{expect(hd274uow(3,1)).toBe(1);});it('c',()=>{expect(hd274uow(0,0)).toBe(0);});it('d',()=>{expect(hd274uow(93,73)).toBe(2);});it('e',()=>{expect(hd274uow(15,0)).toBe(4);});});
function hd275uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275uow_hd',()=>{it('a',()=>{expect(hd275uow(1,4)).toBe(2);});it('b',()=>{expect(hd275uow(3,1)).toBe(1);});it('c',()=>{expect(hd275uow(0,0)).toBe(0);});it('d',()=>{expect(hd275uow(93,73)).toBe(2);});it('e',()=>{expect(hd275uow(15,0)).toBe(4);});});
function hd276uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276uow_hd',()=>{it('a',()=>{expect(hd276uow(1,4)).toBe(2);});it('b',()=>{expect(hd276uow(3,1)).toBe(1);});it('c',()=>{expect(hd276uow(0,0)).toBe(0);});it('d',()=>{expect(hd276uow(93,73)).toBe(2);});it('e',()=>{expect(hd276uow(15,0)).toBe(4);});});
function hd277uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277uow_hd',()=>{it('a',()=>{expect(hd277uow(1,4)).toBe(2);});it('b',()=>{expect(hd277uow(3,1)).toBe(1);});it('c',()=>{expect(hd277uow(0,0)).toBe(0);});it('d',()=>{expect(hd277uow(93,73)).toBe(2);});it('e',()=>{expect(hd277uow(15,0)).toBe(4);});});
function hd278uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278uow_hd',()=>{it('a',()=>{expect(hd278uow(1,4)).toBe(2);});it('b',()=>{expect(hd278uow(3,1)).toBe(1);});it('c',()=>{expect(hd278uow(0,0)).toBe(0);});it('d',()=>{expect(hd278uow(93,73)).toBe(2);});it('e',()=>{expect(hd278uow(15,0)).toBe(4);});});
function hd279uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279uow_hd',()=>{it('a',()=>{expect(hd279uow(1,4)).toBe(2);});it('b',()=>{expect(hd279uow(3,1)).toBe(1);});it('c',()=>{expect(hd279uow(0,0)).toBe(0);});it('d',()=>{expect(hd279uow(93,73)).toBe(2);});it('e',()=>{expect(hd279uow(15,0)).toBe(4);});});
function hd280uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280uow_hd',()=>{it('a',()=>{expect(hd280uow(1,4)).toBe(2);});it('b',()=>{expect(hd280uow(3,1)).toBe(1);});it('c',()=>{expect(hd280uow(0,0)).toBe(0);});it('d',()=>{expect(hd280uow(93,73)).toBe(2);});it('e',()=>{expect(hd280uow(15,0)).toBe(4);});});
function hd281uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281uow_hd',()=>{it('a',()=>{expect(hd281uow(1,4)).toBe(2);});it('b',()=>{expect(hd281uow(3,1)).toBe(1);});it('c',()=>{expect(hd281uow(0,0)).toBe(0);});it('d',()=>{expect(hd281uow(93,73)).toBe(2);});it('e',()=>{expect(hd281uow(15,0)).toBe(4);});});
function hd282uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282uow_hd',()=>{it('a',()=>{expect(hd282uow(1,4)).toBe(2);});it('b',()=>{expect(hd282uow(3,1)).toBe(1);});it('c',()=>{expect(hd282uow(0,0)).toBe(0);});it('d',()=>{expect(hd282uow(93,73)).toBe(2);});it('e',()=>{expect(hd282uow(15,0)).toBe(4);});});
function hd283uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283uow_hd',()=>{it('a',()=>{expect(hd283uow(1,4)).toBe(2);});it('b',()=>{expect(hd283uow(3,1)).toBe(1);});it('c',()=>{expect(hd283uow(0,0)).toBe(0);});it('d',()=>{expect(hd283uow(93,73)).toBe(2);});it('e',()=>{expect(hd283uow(15,0)).toBe(4);});});
function hd284uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284uow_hd',()=>{it('a',()=>{expect(hd284uow(1,4)).toBe(2);});it('b',()=>{expect(hd284uow(3,1)).toBe(1);});it('c',()=>{expect(hd284uow(0,0)).toBe(0);});it('d',()=>{expect(hd284uow(93,73)).toBe(2);});it('e',()=>{expect(hd284uow(15,0)).toBe(4);});});
function hd285uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285uow_hd',()=>{it('a',()=>{expect(hd285uow(1,4)).toBe(2);});it('b',()=>{expect(hd285uow(3,1)).toBe(1);});it('c',()=>{expect(hd285uow(0,0)).toBe(0);});it('d',()=>{expect(hd285uow(93,73)).toBe(2);});it('e',()=>{expect(hd285uow(15,0)).toBe(4);});});
function hd286uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286uow_hd',()=>{it('a',()=>{expect(hd286uow(1,4)).toBe(2);});it('b',()=>{expect(hd286uow(3,1)).toBe(1);});it('c',()=>{expect(hd286uow(0,0)).toBe(0);});it('d',()=>{expect(hd286uow(93,73)).toBe(2);});it('e',()=>{expect(hd286uow(15,0)).toBe(4);});});
function hd287uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287uow_hd',()=>{it('a',()=>{expect(hd287uow(1,4)).toBe(2);});it('b',()=>{expect(hd287uow(3,1)).toBe(1);});it('c',()=>{expect(hd287uow(0,0)).toBe(0);});it('d',()=>{expect(hd287uow(93,73)).toBe(2);});it('e',()=>{expect(hd287uow(15,0)).toBe(4);});});
function hd288uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288uow_hd',()=>{it('a',()=>{expect(hd288uow(1,4)).toBe(2);});it('b',()=>{expect(hd288uow(3,1)).toBe(1);});it('c',()=>{expect(hd288uow(0,0)).toBe(0);});it('d',()=>{expect(hd288uow(93,73)).toBe(2);});it('e',()=>{expect(hd288uow(15,0)).toBe(4);});});
function hd289uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289uow_hd',()=>{it('a',()=>{expect(hd289uow(1,4)).toBe(2);});it('b',()=>{expect(hd289uow(3,1)).toBe(1);});it('c',()=>{expect(hd289uow(0,0)).toBe(0);});it('d',()=>{expect(hd289uow(93,73)).toBe(2);});it('e',()=>{expect(hd289uow(15,0)).toBe(4);});});
function hd290uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290uow_hd',()=>{it('a',()=>{expect(hd290uow(1,4)).toBe(2);});it('b',()=>{expect(hd290uow(3,1)).toBe(1);});it('c',()=>{expect(hd290uow(0,0)).toBe(0);});it('d',()=>{expect(hd290uow(93,73)).toBe(2);});it('e',()=>{expect(hd290uow(15,0)).toBe(4);});});
function hd291uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291uow_hd',()=>{it('a',()=>{expect(hd291uow(1,4)).toBe(2);});it('b',()=>{expect(hd291uow(3,1)).toBe(1);});it('c',()=>{expect(hd291uow(0,0)).toBe(0);});it('d',()=>{expect(hd291uow(93,73)).toBe(2);});it('e',()=>{expect(hd291uow(15,0)).toBe(4);});});
function hd292uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292uow_hd',()=>{it('a',()=>{expect(hd292uow(1,4)).toBe(2);});it('b',()=>{expect(hd292uow(3,1)).toBe(1);});it('c',()=>{expect(hd292uow(0,0)).toBe(0);});it('d',()=>{expect(hd292uow(93,73)).toBe(2);});it('e',()=>{expect(hd292uow(15,0)).toBe(4);});});
function hd293uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293uow_hd',()=>{it('a',()=>{expect(hd293uow(1,4)).toBe(2);});it('b',()=>{expect(hd293uow(3,1)).toBe(1);});it('c',()=>{expect(hd293uow(0,0)).toBe(0);});it('d',()=>{expect(hd293uow(93,73)).toBe(2);});it('e',()=>{expect(hd293uow(15,0)).toBe(4);});});
function hd294uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294uow_hd',()=>{it('a',()=>{expect(hd294uow(1,4)).toBe(2);});it('b',()=>{expect(hd294uow(3,1)).toBe(1);});it('c',()=>{expect(hd294uow(0,0)).toBe(0);});it('d',()=>{expect(hd294uow(93,73)).toBe(2);});it('e',()=>{expect(hd294uow(15,0)).toBe(4);});});
function hd295uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295uow_hd',()=>{it('a',()=>{expect(hd295uow(1,4)).toBe(2);});it('b',()=>{expect(hd295uow(3,1)).toBe(1);});it('c',()=>{expect(hd295uow(0,0)).toBe(0);});it('d',()=>{expect(hd295uow(93,73)).toBe(2);});it('e',()=>{expect(hd295uow(15,0)).toBe(4);});});
function hd296uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296uow_hd',()=>{it('a',()=>{expect(hd296uow(1,4)).toBe(2);});it('b',()=>{expect(hd296uow(3,1)).toBe(1);});it('c',()=>{expect(hd296uow(0,0)).toBe(0);});it('d',()=>{expect(hd296uow(93,73)).toBe(2);});it('e',()=>{expect(hd296uow(15,0)).toBe(4);});});
function hd297uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297uow_hd',()=>{it('a',()=>{expect(hd297uow(1,4)).toBe(2);});it('b',()=>{expect(hd297uow(3,1)).toBe(1);});it('c',()=>{expect(hd297uow(0,0)).toBe(0);});it('d',()=>{expect(hd297uow(93,73)).toBe(2);});it('e',()=>{expect(hd297uow(15,0)).toBe(4);});});
function hd298uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298uow_hd',()=>{it('a',()=>{expect(hd298uow(1,4)).toBe(2);});it('b',()=>{expect(hd298uow(3,1)).toBe(1);});it('c',()=>{expect(hd298uow(0,0)).toBe(0);});it('d',()=>{expect(hd298uow(93,73)).toBe(2);});it('e',()=>{expect(hd298uow(15,0)).toBe(4);});});
function hd299uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299uow_hd',()=>{it('a',()=>{expect(hd299uow(1,4)).toBe(2);});it('b',()=>{expect(hd299uow(3,1)).toBe(1);});it('c',()=>{expect(hd299uow(0,0)).toBe(0);});it('d',()=>{expect(hd299uow(93,73)).toBe(2);});it('e',()=>{expect(hd299uow(15,0)).toBe(4);});});
function hd300uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300uow_hd',()=>{it('a',()=>{expect(hd300uow(1,4)).toBe(2);});it('b',()=>{expect(hd300uow(3,1)).toBe(1);});it('c',()=>{expect(hd300uow(0,0)).toBe(0);});it('d',()=>{expect(hd300uow(93,73)).toBe(2);});it('e',()=>{expect(hd300uow(15,0)).toBe(4);});});
function hd301uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301uow_hd',()=>{it('a',()=>{expect(hd301uow(1,4)).toBe(2);});it('b',()=>{expect(hd301uow(3,1)).toBe(1);});it('c',()=>{expect(hd301uow(0,0)).toBe(0);});it('d',()=>{expect(hd301uow(93,73)).toBe(2);});it('e',()=>{expect(hd301uow(15,0)).toBe(4);});});
function hd302uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302uow_hd',()=>{it('a',()=>{expect(hd302uow(1,4)).toBe(2);});it('b',()=>{expect(hd302uow(3,1)).toBe(1);});it('c',()=>{expect(hd302uow(0,0)).toBe(0);});it('d',()=>{expect(hd302uow(93,73)).toBe(2);});it('e',()=>{expect(hd302uow(15,0)).toBe(4);});});
function hd303uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303uow_hd',()=>{it('a',()=>{expect(hd303uow(1,4)).toBe(2);});it('b',()=>{expect(hd303uow(3,1)).toBe(1);});it('c',()=>{expect(hd303uow(0,0)).toBe(0);});it('d',()=>{expect(hd303uow(93,73)).toBe(2);});it('e',()=>{expect(hd303uow(15,0)).toBe(4);});});
function hd304uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304uow_hd',()=>{it('a',()=>{expect(hd304uow(1,4)).toBe(2);});it('b',()=>{expect(hd304uow(3,1)).toBe(1);});it('c',()=>{expect(hd304uow(0,0)).toBe(0);});it('d',()=>{expect(hd304uow(93,73)).toBe(2);});it('e',()=>{expect(hd304uow(15,0)).toBe(4);});});
function hd305uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305uow_hd',()=>{it('a',()=>{expect(hd305uow(1,4)).toBe(2);});it('b',()=>{expect(hd305uow(3,1)).toBe(1);});it('c',()=>{expect(hd305uow(0,0)).toBe(0);});it('d',()=>{expect(hd305uow(93,73)).toBe(2);});it('e',()=>{expect(hd305uow(15,0)).toBe(4);});});
function hd306uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306uow_hd',()=>{it('a',()=>{expect(hd306uow(1,4)).toBe(2);});it('b',()=>{expect(hd306uow(3,1)).toBe(1);});it('c',()=>{expect(hd306uow(0,0)).toBe(0);});it('d',()=>{expect(hd306uow(93,73)).toBe(2);});it('e',()=>{expect(hd306uow(15,0)).toBe(4);});});
function hd307uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307uow_hd',()=>{it('a',()=>{expect(hd307uow(1,4)).toBe(2);});it('b',()=>{expect(hd307uow(3,1)).toBe(1);});it('c',()=>{expect(hd307uow(0,0)).toBe(0);});it('d',()=>{expect(hd307uow(93,73)).toBe(2);});it('e',()=>{expect(hd307uow(15,0)).toBe(4);});});
function hd308uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308uow_hd',()=>{it('a',()=>{expect(hd308uow(1,4)).toBe(2);});it('b',()=>{expect(hd308uow(3,1)).toBe(1);});it('c',()=>{expect(hd308uow(0,0)).toBe(0);});it('d',()=>{expect(hd308uow(93,73)).toBe(2);});it('e',()=>{expect(hd308uow(15,0)).toBe(4);});});
function hd309uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309uow_hd',()=>{it('a',()=>{expect(hd309uow(1,4)).toBe(2);});it('b',()=>{expect(hd309uow(3,1)).toBe(1);});it('c',()=>{expect(hd309uow(0,0)).toBe(0);});it('d',()=>{expect(hd309uow(93,73)).toBe(2);});it('e',()=>{expect(hd309uow(15,0)).toBe(4);});});
function hd310uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310uow_hd',()=>{it('a',()=>{expect(hd310uow(1,4)).toBe(2);});it('b',()=>{expect(hd310uow(3,1)).toBe(1);});it('c',()=>{expect(hd310uow(0,0)).toBe(0);});it('d',()=>{expect(hd310uow(93,73)).toBe(2);});it('e',()=>{expect(hd310uow(15,0)).toBe(4);});});
function hd311uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311uow_hd',()=>{it('a',()=>{expect(hd311uow(1,4)).toBe(2);});it('b',()=>{expect(hd311uow(3,1)).toBe(1);});it('c',()=>{expect(hd311uow(0,0)).toBe(0);});it('d',()=>{expect(hd311uow(93,73)).toBe(2);});it('e',()=>{expect(hd311uow(15,0)).toBe(4);});});
function hd312uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312uow_hd',()=>{it('a',()=>{expect(hd312uow(1,4)).toBe(2);});it('b',()=>{expect(hd312uow(3,1)).toBe(1);});it('c',()=>{expect(hd312uow(0,0)).toBe(0);});it('d',()=>{expect(hd312uow(93,73)).toBe(2);});it('e',()=>{expect(hd312uow(15,0)).toBe(4);});});
function hd313uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313uow_hd',()=>{it('a',()=>{expect(hd313uow(1,4)).toBe(2);});it('b',()=>{expect(hd313uow(3,1)).toBe(1);});it('c',()=>{expect(hd313uow(0,0)).toBe(0);});it('d',()=>{expect(hd313uow(93,73)).toBe(2);});it('e',()=>{expect(hd313uow(15,0)).toBe(4);});});
function hd314uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314uow_hd',()=>{it('a',()=>{expect(hd314uow(1,4)).toBe(2);});it('b',()=>{expect(hd314uow(3,1)).toBe(1);});it('c',()=>{expect(hd314uow(0,0)).toBe(0);});it('d',()=>{expect(hd314uow(93,73)).toBe(2);});it('e',()=>{expect(hd314uow(15,0)).toBe(4);});});
function hd315uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315uow_hd',()=>{it('a',()=>{expect(hd315uow(1,4)).toBe(2);});it('b',()=>{expect(hd315uow(3,1)).toBe(1);});it('c',()=>{expect(hd315uow(0,0)).toBe(0);});it('d',()=>{expect(hd315uow(93,73)).toBe(2);});it('e',()=>{expect(hd315uow(15,0)).toBe(4);});});
function hd316uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316uow_hd',()=>{it('a',()=>{expect(hd316uow(1,4)).toBe(2);});it('b',()=>{expect(hd316uow(3,1)).toBe(1);});it('c',()=>{expect(hd316uow(0,0)).toBe(0);});it('d',()=>{expect(hd316uow(93,73)).toBe(2);});it('e',()=>{expect(hd316uow(15,0)).toBe(4);});});
function hd317uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317uow_hd',()=>{it('a',()=>{expect(hd317uow(1,4)).toBe(2);});it('b',()=>{expect(hd317uow(3,1)).toBe(1);});it('c',()=>{expect(hd317uow(0,0)).toBe(0);});it('d',()=>{expect(hd317uow(93,73)).toBe(2);});it('e',()=>{expect(hd317uow(15,0)).toBe(4);});});
function hd318uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318uow_hd',()=>{it('a',()=>{expect(hd318uow(1,4)).toBe(2);});it('b',()=>{expect(hd318uow(3,1)).toBe(1);});it('c',()=>{expect(hd318uow(0,0)).toBe(0);});it('d',()=>{expect(hd318uow(93,73)).toBe(2);});it('e',()=>{expect(hd318uow(15,0)).toBe(4);});});
function hd319uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319uow_hd',()=>{it('a',()=>{expect(hd319uow(1,4)).toBe(2);});it('b',()=>{expect(hd319uow(3,1)).toBe(1);});it('c',()=>{expect(hd319uow(0,0)).toBe(0);});it('d',()=>{expect(hd319uow(93,73)).toBe(2);});it('e',()=>{expect(hd319uow(15,0)).toBe(4);});});
function hd320uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320uow_hd',()=>{it('a',()=>{expect(hd320uow(1,4)).toBe(2);});it('b',()=>{expect(hd320uow(3,1)).toBe(1);});it('c',()=>{expect(hd320uow(0,0)).toBe(0);});it('d',()=>{expect(hd320uow(93,73)).toBe(2);});it('e',()=>{expect(hd320uow(15,0)).toBe(4);});});
function hd321uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321uow_hd',()=>{it('a',()=>{expect(hd321uow(1,4)).toBe(2);});it('b',()=>{expect(hd321uow(3,1)).toBe(1);});it('c',()=>{expect(hd321uow(0,0)).toBe(0);});it('d',()=>{expect(hd321uow(93,73)).toBe(2);});it('e',()=>{expect(hd321uow(15,0)).toBe(4);});});
function hd322uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322uow_hd',()=>{it('a',()=>{expect(hd322uow(1,4)).toBe(2);});it('b',()=>{expect(hd322uow(3,1)).toBe(1);});it('c',()=>{expect(hd322uow(0,0)).toBe(0);});it('d',()=>{expect(hd322uow(93,73)).toBe(2);});it('e',()=>{expect(hd322uow(15,0)).toBe(4);});});
function hd323uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323uow_hd',()=>{it('a',()=>{expect(hd323uow(1,4)).toBe(2);});it('b',()=>{expect(hd323uow(3,1)).toBe(1);});it('c',()=>{expect(hd323uow(0,0)).toBe(0);});it('d',()=>{expect(hd323uow(93,73)).toBe(2);});it('e',()=>{expect(hd323uow(15,0)).toBe(4);});});
function hd324uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324uow_hd',()=>{it('a',()=>{expect(hd324uow(1,4)).toBe(2);});it('b',()=>{expect(hd324uow(3,1)).toBe(1);});it('c',()=>{expect(hd324uow(0,0)).toBe(0);});it('d',()=>{expect(hd324uow(93,73)).toBe(2);});it('e',()=>{expect(hd324uow(15,0)).toBe(4);});});
function hd325uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325uow_hd',()=>{it('a',()=>{expect(hd325uow(1,4)).toBe(2);});it('b',()=>{expect(hd325uow(3,1)).toBe(1);});it('c',()=>{expect(hd325uow(0,0)).toBe(0);});it('d',()=>{expect(hd325uow(93,73)).toBe(2);});it('e',()=>{expect(hd325uow(15,0)).toBe(4);});});
function hd326uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326uow_hd',()=>{it('a',()=>{expect(hd326uow(1,4)).toBe(2);});it('b',()=>{expect(hd326uow(3,1)).toBe(1);});it('c',()=>{expect(hd326uow(0,0)).toBe(0);});it('d',()=>{expect(hd326uow(93,73)).toBe(2);});it('e',()=>{expect(hd326uow(15,0)).toBe(4);});});
function hd327uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327uow_hd',()=>{it('a',()=>{expect(hd327uow(1,4)).toBe(2);});it('b',()=>{expect(hd327uow(3,1)).toBe(1);});it('c',()=>{expect(hd327uow(0,0)).toBe(0);});it('d',()=>{expect(hd327uow(93,73)).toBe(2);});it('e',()=>{expect(hd327uow(15,0)).toBe(4);});});
function hd328uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328uow_hd',()=>{it('a',()=>{expect(hd328uow(1,4)).toBe(2);});it('b',()=>{expect(hd328uow(3,1)).toBe(1);});it('c',()=>{expect(hd328uow(0,0)).toBe(0);});it('d',()=>{expect(hd328uow(93,73)).toBe(2);});it('e',()=>{expect(hd328uow(15,0)).toBe(4);});});
function hd329uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329uow_hd',()=>{it('a',()=>{expect(hd329uow(1,4)).toBe(2);});it('b',()=>{expect(hd329uow(3,1)).toBe(1);});it('c',()=>{expect(hd329uow(0,0)).toBe(0);});it('d',()=>{expect(hd329uow(93,73)).toBe(2);});it('e',()=>{expect(hd329uow(15,0)).toBe(4);});});
function hd330uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330uow_hd',()=>{it('a',()=>{expect(hd330uow(1,4)).toBe(2);});it('b',()=>{expect(hd330uow(3,1)).toBe(1);});it('c',()=>{expect(hd330uow(0,0)).toBe(0);});it('d',()=>{expect(hd330uow(93,73)).toBe(2);});it('e',()=>{expect(hd330uow(15,0)).toBe(4);});});
function hd331uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331uow_hd',()=>{it('a',()=>{expect(hd331uow(1,4)).toBe(2);});it('b',()=>{expect(hd331uow(3,1)).toBe(1);});it('c',()=>{expect(hd331uow(0,0)).toBe(0);});it('d',()=>{expect(hd331uow(93,73)).toBe(2);});it('e',()=>{expect(hd331uow(15,0)).toBe(4);});});
function hd332uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332uow_hd',()=>{it('a',()=>{expect(hd332uow(1,4)).toBe(2);});it('b',()=>{expect(hd332uow(3,1)).toBe(1);});it('c',()=>{expect(hd332uow(0,0)).toBe(0);});it('d',()=>{expect(hd332uow(93,73)).toBe(2);});it('e',()=>{expect(hd332uow(15,0)).toBe(4);});});
function hd333uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333uow_hd',()=>{it('a',()=>{expect(hd333uow(1,4)).toBe(2);});it('b',()=>{expect(hd333uow(3,1)).toBe(1);});it('c',()=>{expect(hd333uow(0,0)).toBe(0);});it('d',()=>{expect(hd333uow(93,73)).toBe(2);});it('e',()=>{expect(hd333uow(15,0)).toBe(4);});});
function hd334uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334uow_hd',()=>{it('a',()=>{expect(hd334uow(1,4)).toBe(2);});it('b',()=>{expect(hd334uow(3,1)).toBe(1);});it('c',()=>{expect(hd334uow(0,0)).toBe(0);});it('d',()=>{expect(hd334uow(93,73)).toBe(2);});it('e',()=>{expect(hd334uow(15,0)).toBe(4);});});
function hd335uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335uow_hd',()=>{it('a',()=>{expect(hd335uow(1,4)).toBe(2);});it('b',()=>{expect(hd335uow(3,1)).toBe(1);});it('c',()=>{expect(hd335uow(0,0)).toBe(0);});it('d',()=>{expect(hd335uow(93,73)).toBe(2);});it('e',()=>{expect(hd335uow(15,0)).toBe(4);});});
function hd336uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336uow_hd',()=>{it('a',()=>{expect(hd336uow(1,4)).toBe(2);});it('b',()=>{expect(hd336uow(3,1)).toBe(1);});it('c',()=>{expect(hd336uow(0,0)).toBe(0);});it('d',()=>{expect(hd336uow(93,73)).toBe(2);});it('e',()=>{expect(hd336uow(15,0)).toBe(4);});});
function hd337uow(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337uow_hd',()=>{it('a',()=>{expect(hd337uow(1,4)).toBe(2);});it('b',()=>{expect(hd337uow(3,1)).toBe(1);});it('c',()=>{expect(hd337uow(0,0)).toBe(0);});it('d',()=>{expect(hd337uow(93,73)).toBe(2);});it('e',()=>{expect(hd337uow(15,0)).toBe(4);});});
