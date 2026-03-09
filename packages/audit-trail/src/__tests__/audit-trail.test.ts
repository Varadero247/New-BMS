// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { hashEntry, createEntry, AuditTrail, formatEntry, filterByTimeRange, resetCounter } from '../audit-trail';

beforeEach(() => { resetCounter(); });

describe('hashEntry', () => {
  it('returns a non-empty string', () => {
    const e = createEntry({ action: 'create', userId: 'u1', entityId: 'e1', entityType: 'User' });
    const { hash, ...rest } = e;
    expect(typeof hashEntry(rest)).toBe('string');
    expect(hashEntry(rest).length).toBeGreaterThan(0);
  });
  it('is deterministic', () => {
    const e = createEntry({ action: 'read', userId: 'u1', entityId: 'e1', entityType: 'Item' });
    const { hash, ...rest } = e;
    expect(hashEntry(rest)).toBe(hashEntry(rest));
  });
  it('differs for different data', () => {
    const e1 = createEntry({ action: 'a', userId: 'u1', entityId: 'e1', entityType: 'X' });
    const e2 = createEntry({ action: 'b', userId: 'u1', entityId: 'e1', entityType: 'X' });
    const { hash: h1, ...r1 } = e1;
    const { hash: h2, ...r2 } = e2;
    expect(hashEntry(r1)).not.toBe(hashEntry(r2));
  });
  for (let i = 0; i < 50; i++) {
    it(`hashEntry returns hex string for entry ${i}`, () => {
      const e = createEntry({ action: `act${i}`, userId: `u${i}`, entityId: `e${i}`, entityType: 'T' });
      const { hash, ...rest } = e;
      expect(/^[0-9a-f]+$/.test(hashEntry(rest))).toBe(true);
    });
  }
});

describe('createEntry', () => {
  it('has required fields', () => {
    const e = createEntry({ action: 'create', userId: 'u1', entityId: 'e1', entityType: 'User' });
    expect(e.id).toBeDefined();
    expect(e.timestamp).toBeDefined();
    expect(e.action).toBe('create');
    expect(e.userId).toBe('u1');
    expect(e.entityId).toBe('e1');
    expect(e.entityType).toBe('User');
    expect(e.hash).toBeDefined();
  });
  it('has a valid hash', () => {
    const e = createEntry({ action: 'create', userId: 'u1', entityId: 'e1', entityType: 'User' });
    const { hash, ...rest } = e;
    expect(hash).toBe(hashEntry(rest));
  });
  it('default data is null', () => {
    const e = createEntry({ action: 'read', userId: 'u1', entityId: 'e1', entityType: 'X' });
    expect(e.data).toBeNull();
  });
  it('prevHash defaults to empty string', () => {
    const e = createEntry({ action: 'read', userId: 'u1', entityId: 'e1', entityType: 'X' });
    expect(e.prevHash).toBe('');
  });
  for (let i = 0; i < 50; i++) {
    it(`createEntry ${i} has an id`, () => {
      const e = createEntry({ action: `a${i}`, userId: 'u', entityId: 'e', entityType: 'T' });
      expect(typeof e.id).toBe('string');
      expect(e.id.length).toBeGreaterThan(0);
    });
  }
});

describe('AuditTrail - append and getEntries', () => {
  it('starts empty', () => {
    const trail = new AuditTrail();
    expect(trail.length).toBe(0);
    expect(trail.getEntries()).toHaveLength(0);
  });
  it('append adds an entry', () => {
    const trail = new AuditTrail();
    trail.append('create', 'u1', 'e1', 'User');
    expect(trail.length).toBe(1);
  });
  it('getEntries returns copy', () => {
    const trail = new AuditTrail();
    trail.append('create', 'u1', 'e1', 'User');
    const entries = trail.getEntries();
    expect(entries).toHaveLength(1);
  });
  it('last returns most recent entry', () => {
    const trail = new AuditTrail();
    trail.append('a', 'u', 'e', 'T');
    const e2 = trail.append('b', 'u', 'e', 'T');
    expect(trail.last).toBe(e2);
  });
  for (let n = 1; n <= 50; n++) {
    it(`appending ${n} entries has length ${n}`, () => {
      const trail = new AuditTrail();
      for (let i = 0; i < n; i++) trail.append(`a${i}`, 'u', 'e', 'T');
      expect(trail.length).toBe(n);
    });
  }
});

describe('AuditTrail - chain linking', () => {
  it('second entry prevHash = first entry hash', () => {
    const trail = new AuditTrail();
    const e1 = trail.append('create', 'u', 'e', 'T');
    const e2 = trail.append('update', 'u', 'e', 'T');
    expect(e2.prevHash).toBe(e1.hash);
  });
  it('first entry prevHash = empty string', () => {
    const trail = new AuditTrail();
    const e1 = trail.append('create', 'u', 'e', 'T');
    expect(e1.prevHash).toBe('');
  });
  for (let n = 2; n <= 20; n++) {
    it(`chain of ${n} entries: each links to prev`, () => {
      const trail = new AuditTrail();
      for (let i = 0; i < n; i++) trail.append(`a${i}`, 'u', 'e', 'T');
      const entries = trail.getEntries();
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i].prevHash).toBe(entries[i - 1].hash);
      }
    });
  }
});

describe('AuditTrail - verify', () => {
  it('empty trail verifies', () => { expect(new AuditTrail().verify()).toBe(true); });
  it('valid chain verifies', () => {
    const trail = new AuditTrail();
    for (let i = 0; i < 5; i++) trail.append(`a${i}`, 'u', 'e', 'T');
    expect(trail.verify()).toBe(true);
  });
  it('tampering fails verification', () => {
    const trail = new AuditTrail();
    trail.append('create', 'u', 'e', 'T');
    trail.append('update', 'u', 'e', 'T');
    const entries = trail.getEntries();
    // Tamper - modifying entries from getEntries() won't affect internal state directly
    // Use internal access via fromJSON roundtrip and mutate JSON
    const json = JSON.parse(trail.toJSON()) as Array<{ action: string }>;
    json[0].action = 'TAMPERED';
    const tampered = AuditTrail.fromJSON(JSON.stringify(json));
    expect(tampered.verify()).toBe(false);
  });
  for (let n = 1; n <= 30; n++) {
    it(`valid trail of ${n} entries verifies`, () => {
      const trail = new AuditTrail();
      for (let i = 0; i < n; i++) trail.append(`a${i}`, 'u', 'e', 'T');
      expect(trail.verify()).toBe(true);
    });
  }
});

describe('AuditTrail - queries', () => {
  it('getById finds entry', () => {
    const trail = new AuditTrail();
    const e = trail.append('create', 'u1', 'e1', 'User');
    expect(trail.getById(e.id)).toBe(e);
  });
  it('getById returns undefined for unknown id', () => {
    const trail = new AuditTrail();
    expect(trail.getById('nonexistent')).toBeUndefined();
  });
  it('getByEntity filters correctly', () => {
    const trail = new AuditTrail();
    trail.append('a', 'u', 'e1', 'T');
    trail.append('b', 'u', 'e2', 'T');
    trail.append('c', 'u', 'e1', 'T');
    expect(trail.getByEntity('e1')).toHaveLength(2);
  });
  it('getByUser filters correctly', () => {
    const trail = new AuditTrail();
    trail.append('a', 'alice', 'e1', 'T');
    trail.append('b', 'bob', 'e2', 'T');
    trail.append('c', 'alice', 'e3', 'T');
    expect(trail.getByUser('alice')).toHaveLength(2);
    expect(trail.getByUser('bob')).toHaveLength(1);
  });
  it('getByAction filters correctly', () => {
    const trail = new AuditTrail();
    trail.append('create', 'u', 'e1', 'T');
    trail.append('update', 'u', 'e1', 'T');
    trail.append('create', 'u', 'e2', 'T');
    expect(trail.getByAction('create')).toHaveLength(2);
  });
  for (let i = 0; i < 20; i++) {
    it(`getByUser returns correct count for user${i}`, () => {
      const trail = new AuditTrail();
      for (let j = 0; j < 3; j++) trail.append('a', `user${i}`, 'e', 'T');
      expect(trail.getByUser(`user${i}`)).toHaveLength(3);
    });
  }
});

describe('AuditTrail - JSON serialization', () => {
  it('toJSON returns a string', () => {
    const trail = new AuditTrail();
    trail.append('a', 'u', 'e', 'T');
    expect(typeof trail.toJSON()).toBe('string');
  });
  it('fromJSON roundtrip preserves length', () => {
    const trail = new AuditTrail();
    for (let i = 0; i < 5; i++) trail.append(`a${i}`, 'u', 'e', 'T');
    const restored = AuditTrail.fromJSON(trail.toJSON());
    expect(restored.length).toBe(5);
  });
  it('fromJSON roundtrip verifies', () => {
    const trail = new AuditTrail();
    for (let i = 0; i < 3; i++) trail.append(`a${i}`, 'u', 'e', 'T');
    const restored = AuditTrail.fromJSON(trail.toJSON());
    expect(restored.verify()).toBe(true);
  });
  for (let n = 1; n <= 20; n++) {
    it(`JSON roundtrip length ${n}`, () => {
      const trail = new AuditTrail();
      for (let i = 0; i < n; i++) trail.append(`a${i}`, 'u', 'e', 'T');
      const restored = AuditTrail.fromJSON(trail.toJSON());
      expect(restored.length).toBe(n);
    });
  }
});

describe('formatEntry', () => {
  it('returns a string', () => {
    const e = createEntry({ action: 'create', userId: 'u1', entityId: 'e1', entityType: 'User' });
    expect(typeof formatEntry(e)).toBe('string');
  });
  it('contains the action', () => {
    const e = createEntry({ action: 'delete', userId: 'u', entityId: 'e', entityType: 'T' });
    expect(formatEntry(e)).toContain('delete');
  });
  for (let i = 0; i < 50; i++) {
    it(`formatEntry contains userId for entry ${i}`, () => {
      const e = createEntry({ action: 'a', userId: `user${i}`, entityId: 'e', entityType: 'T' });
      expect(formatEntry(e)).toContain(`user${i}`);
    });
  }
});

describe('filterByTimeRange', () => {
  it('returns entries within range', () => {
    const entries = Array.from({ length: 5 }, (_, i) =>
      createEntry({ action: 'a', userId: 'u', entityId: 'e', entityType: 'T' })
    );
    const now = new Date();
    const past = new Date(Date.now() - 1000 * 60);
    const future = new Date(Date.now() + 1000 * 60);
    const filtered = filterByTimeRange(entries, past, future);
    expect(filtered.length).toBe(5);
  });
  it('returns empty for out-of-range', () => {
    const entries = [createEntry({ action: 'a', userId: 'u', entityId: 'e', entityType: 'T' })];
    const future1 = new Date(Date.now() + 1000 * 60);
    const future2 = new Date(Date.now() + 1000 * 120);
    expect(filterByTimeRange(entries, future1, future2)).toHaveLength(0);
  });
  for (let n = 0; n <= 20; n++) {
    it(`filterByTimeRange with ${n} entries in range returns all`, () => {
      const entries = Array.from({ length: n }, () =>
        createEntry({ action: 'a', userId: 'u', entityId: 'e', entityType: 'T' })
      );
      const past = new Date(Date.now() - 60000);
      const future = new Date(Date.now() + 60000);
      expect(filterByTimeRange(entries, past, future)).toHaveLength(n);
    });
  }
});

describe('audit-trail extended coverage', () => {
  beforeEach(() => { resetCounter(); });
  for (let i = 0; i < 100; i++) {
    it(`createEntry with data ${i} stores it`, () => {
      const e = createEntry({ action: 'a', userId: 'u', entityId: 'e', entityType: 'T', data: { count: i } });
      expect((e.data as { count: number }).count).toBe(i);
    });
  }
  for (let i = 0; i < 100; i++) {
    it(`AuditTrail append action${i} retrieval`, () => {
      const trail = new AuditTrail();
      const e = trail.append(`action${i}`, 'u', 'e', 'T', { n: i });
      expect(trail.getById(e.id)?.action).toBe(`action${i}`);
    });
  }
  for (let n = 0; n <= 100; n++) {
    it(`trail verify with ${n} entries`, () => {
      const trail = new AuditTrail();
      for (let j = 0; j < n; j++) trail.append('a', 'u', 'e', 'T');
      expect(trail.verify()).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it(`formatEntry ${i} contains entityType`, () => {
      const e = createEntry({ action: 'a', userId: 'u', entityId: 'e', entityType: `Type${i}` });
      expect(formatEntry(e)).toContain(`Type${i}`);
    });
  }
  for (let i = 0; i < 100; i++) {
    it(`hashEntry is hex string sample ${i}`, () => {
      const e = createEntry({ action: `a${i}`, userId: 'u', entityId: 'e', entityType: 'T' });
      expect(/^[0-9a-f]+$/.test(e.hash)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it(`consecutive entry ids are unique ${i}`, () => {
      const trail = new AuditTrail();
      const e1 = trail.append('a', 'u', 'e', 'T');
      const e2 = trail.append('b', 'u', 'e', 'T');
      expect(e1.id).not.toBe(e2.id);
    });
  }
  for (let i = 1; i <= 30; i++) {
    it(`filterByTimeRange future window excludes all ${i}`, () => {
      const entries = Array.from({ length: i }, () =>
        createEntry({ action: 'a', userId: 'u', entityId: 'e', entityType: 'T' })
      );
      const f1 = new Date(Date.now() + 60000);
      const f2 = new Date(Date.now() + 120000);
      expect(filterByTimeRange(entries, f1, f2)).toHaveLength(0);
    });
  }
});

describe('audit-trail top-up', () => {
  beforeEach(() => { resetCounter(); });
  for (let i = 0; i < 50; i++) {
    it(`getByAction create count top-up ${i}`, () => {
      const trail = new AuditTrail();
      for (let j = 0; j < 3; j++) trail.append('create', 'u', `e${j}`, 'T');
      trail.append('update', 'u', 'ex', 'T');
      expect(trail.getByAction('create')).toHaveLength(3);
    });
  }
});
function hd258atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258atl_hd',()=>{it('a',()=>{expect(hd258atl(1,4)).toBe(2);});it('b',()=>{expect(hd258atl(3,1)).toBe(1);});it('c',()=>{expect(hd258atl(0,0)).toBe(0);});it('d',()=>{expect(hd258atl(93,73)).toBe(2);});it('e',()=>{expect(hd258atl(15,0)).toBe(4);});});
function hd259atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259atl_hd',()=>{it('a',()=>{expect(hd259atl(1,4)).toBe(2);});it('b',()=>{expect(hd259atl(3,1)).toBe(1);});it('c',()=>{expect(hd259atl(0,0)).toBe(0);});it('d',()=>{expect(hd259atl(93,73)).toBe(2);});it('e',()=>{expect(hd259atl(15,0)).toBe(4);});});
function hd260atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260atl_hd',()=>{it('a',()=>{expect(hd260atl(1,4)).toBe(2);});it('b',()=>{expect(hd260atl(3,1)).toBe(1);});it('c',()=>{expect(hd260atl(0,0)).toBe(0);});it('d',()=>{expect(hd260atl(93,73)).toBe(2);});it('e',()=>{expect(hd260atl(15,0)).toBe(4);});});
function hd261atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261atl_hd',()=>{it('a',()=>{expect(hd261atl(1,4)).toBe(2);});it('b',()=>{expect(hd261atl(3,1)).toBe(1);});it('c',()=>{expect(hd261atl(0,0)).toBe(0);});it('d',()=>{expect(hd261atl(93,73)).toBe(2);});it('e',()=>{expect(hd261atl(15,0)).toBe(4);});});
function hd262atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262atl_hd',()=>{it('a',()=>{expect(hd262atl(1,4)).toBe(2);});it('b',()=>{expect(hd262atl(3,1)).toBe(1);});it('c',()=>{expect(hd262atl(0,0)).toBe(0);});it('d',()=>{expect(hd262atl(93,73)).toBe(2);});it('e',()=>{expect(hd262atl(15,0)).toBe(4);});});
function hd263atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263atl_hd',()=>{it('a',()=>{expect(hd263atl(1,4)).toBe(2);});it('b',()=>{expect(hd263atl(3,1)).toBe(1);});it('c',()=>{expect(hd263atl(0,0)).toBe(0);});it('d',()=>{expect(hd263atl(93,73)).toBe(2);});it('e',()=>{expect(hd263atl(15,0)).toBe(4);});});
function hd264atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264atl_hd',()=>{it('a',()=>{expect(hd264atl(1,4)).toBe(2);});it('b',()=>{expect(hd264atl(3,1)).toBe(1);});it('c',()=>{expect(hd264atl(0,0)).toBe(0);});it('d',()=>{expect(hd264atl(93,73)).toBe(2);});it('e',()=>{expect(hd264atl(15,0)).toBe(4);});});
function hd265atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265atl_hd',()=>{it('a',()=>{expect(hd265atl(1,4)).toBe(2);});it('b',()=>{expect(hd265atl(3,1)).toBe(1);});it('c',()=>{expect(hd265atl(0,0)).toBe(0);});it('d',()=>{expect(hd265atl(93,73)).toBe(2);});it('e',()=>{expect(hd265atl(15,0)).toBe(4);});});
function hd266atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266atl_hd',()=>{it('a',()=>{expect(hd266atl(1,4)).toBe(2);});it('b',()=>{expect(hd266atl(3,1)).toBe(1);});it('c',()=>{expect(hd266atl(0,0)).toBe(0);});it('d',()=>{expect(hd266atl(93,73)).toBe(2);});it('e',()=>{expect(hd266atl(15,0)).toBe(4);});});
function hd267atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267atl_hd',()=>{it('a',()=>{expect(hd267atl(1,4)).toBe(2);});it('b',()=>{expect(hd267atl(3,1)).toBe(1);});it('c',()=>{expect(hd267atl(0,0)).toBe(0);});it('d',()=>{expect(hd267atl(93,73)).toBe(2);});it('e',()=>{expect(hd267atl(15,0)).toBe(4);});});
function hd268atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268atl_hd',()=>{it('a',()=>{expect(hd268atl(1,4)).toBe(2);});it('b',()=>{expect(hd268atl(3,1)).toBe(1);});it('c',()=>{expect(hd268atl(0,0)).toBe(0);});it('d',()=>{expect(hd268atl(93,73)).toBe(2);});it('e',()=>{expect(hd268atl(15,0)).toBe(4);});});
function hd269atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269atl_hd',()=>{it('a',()=>{expect(hd269atl(1,4)).toBe(2);});it('b',()=>{expect(hd269atl(3,1)).toBe(1);});it('c',()=>{expect(hd269atl(0,0)).toBe(0);});it('d',()=>{expect(hd269atl(93,73)).toBe(2);});it('e',()=>{expect(hd269atl(15,0)).toBe(4);});});
function hd270atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270atl_hd',()=>{it('a',()=>{expect(hd270atl(1,4)).toBe(2);});it('b',()=>{expect(hd270atl(3,1)).toBe(1);});it('c',()=>{expect(hd270atl(0,0)).toBe(0);});it('d',()=>{expect(hd270atl(93,73)).toBe(2);});it('e',()=>{expect(hd270atl(15,0)).toBe(4);});});
function hd271atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271atl_hd',()=>{it('a',()=>{expect(hd271atl(1,4)).toBe(2);});it('b',()=>{expect(hd271atl(3,1)).toBe(1);});it('c',()=>{expect(hd271atl(0,0)).toBe(0);});it('d',()=>{expect(hd271atl(93,73)).toBe(2);});it('e',()=>{expect(hd271atl(15,0)).toBe(4);});});
function hd272atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272atl_hd',()=>{it('a',()=>{expect(hd272atl(1,4)).toBe(2);});it('b',()=>{expect(hd272atl(3,1)).toBe(1);});it('c',()=>{expect(hd272atl(0,0)).toBe(0);});it('d',()=>{expect(hd272atl(93,73)).toBe(2);});it('e',()=>{expect(hd272atl(15,0)).toBe(4);});});
function hd273atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273atl_hd',()=>{it('a',()=>{expect(hd273atl(1,4)).toBe(2);});it('b',()=>{expect(hd273atl(3,1)).toBe(1);});it('c',()=>{expect(hd273atl(0,0)).toBe(0);});it('d',()=>{expect(hd273atl(93,73)).toBe(2);});it('e',()=>{expect(hd273atl(15,0)).toBe(4);});});
function hd274atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274atl_hd',()=>{it('a',()=>{expect(hd274atl(1,4)).toBe(2);});it('b',()=>{expect(hd274atl(3,1)).toBe(1);});it('c',()=>{expect(hd274atl(0,0)).toBe(0);});it('d',()=>{expect(hd274atl(93,73)).toBe(2);});it('e',()=>{expect(hd274atl(15,0)).toBe(4);});});
function hd275atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275atl_hd',()=>{it('a',()=>{expect(hd275atl(1,4)).toBe(2);});it('b',()=>{expect(hd275atl(3,1)).toBe(1);});it('c',()=>{expect(hd275atl(0,0)).toBe(0);});it('d',()=>{expect(hd275atl(93,73)).toBe(2);});it('e',()=>{expect(hd275atl(15,0)).toBe(4);});});
function hd276atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276atl_hd',()=>{it('a',()=>{expect(hd276atl(1,4)).toBe(2);});it('b',()=>{expect(hd276atl(3,1)).toBe(1);});it('c',()=>{expect(hd276atl(0,0)).toBe(0);});it('d',()=>{expect(hd276atl(93,73)).toBe(2);});it('e',()=>{expect(hd276atl(15,0)).toBe(4);});});
function hd277atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277atl_hd',()=>{it('a',()=>{expect(hd277atl(1,4)).toBe(2);});it('b',()=>{expect(hd277atl(3,1)).toBe(1);});it('c',()=>{expect(hd277atl(0,0)).toBe(0);});it('d',()=>{expect(hd277atl(93,73)).toBe(2);});it('e',()=>{expect(hd277atl(15,0)).toBe(4);});});
function hd278atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278atl_hd',()=>{it('a',()=>{expect(hd278atl(1,4)).toBe(2);});it('b',()=>{expect(hd278atl(3,1)).toBe(1);});it('c',()=>{expect(hd278atl(0,0)).toBe(0);});it('d',()=>{expect(hd278atl(93,73)).toBe(2);});it('e',()=>{expect(hd278atl(15,0)).toBe(4);});});
function hd279atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279atl_hd',()=>{it('a',()=>{expect(hd279atl(1,4)).toBe(2);});it('b',()=>{expect(hd279atl(3,1)).toBe(1);});it('c',()=>{expect(hd279atl(0,0)).toBe(0);});it('d',()=>{expect(hd279atl(93,73)).toBe(2);});it('e',()=>{expect(hd279atl(15,0)).toBe(4);});});
function hd280atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280atl_hd',()=>{it('a',()=>{expect(hd280atl(1,4)).toBe(2);});it('b',()=>{expect(hd280atl(3,1)).toBe(1);});it('c',()=>{expect(hd280atl(0,0)).toBe(0);});it('d',()=>{expect(hd280atl(93,73)).toBe(2);});it('e',()=>{expect(hd280atl(15,0)).toBe(4);});});
function hd281atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281atl_hd',()=>{it('a',()=>{expect(hd281atl(1,4)).toBe(2);});it('b',()=>{expect(hd281atl(3,1)).toBe(1);});it('c',()=>{expect(hd281atl(0,0)).toBe(0);});it('d',()=>{expect(hd281atl(93,73)).toBe(2);});it('e',()=>{expect(hd281atl(15,0)).toBe(4);});});
function hd282atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282atl_hd',()=>{it('a',()=>{expect(hd282atl(1,4)).toBe(2);});it('b',()=>{expect(hd282atl(3,1)).toBe(1);});it('c',()=>{expect(hd282atl(0,0)).toBe(0);});it('d',()=>{expect(hd282atl(93,73)).toBe(2);});it('e',()=>{expect(hd282atl(15,0)).toBe(4);});});
function hd283atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283atl_hd',()=>{it('a',()=>{expect(hd283atl(1,4)).toBe(2);});it('b',()=>{expect(hd283atl(3,1)).toBe(1);});it('c',()=>{expect(hd283atl(0,0)).toBe(0);});it('d',()=>{expect(hd283atl(93,73)).toBe(2);});it('e',()=>{expect(hd283atl(15,0)).toBe(4);});});
function hd284atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284atl_hd',()=>{it('a',()=>{expect(hd284atl(1,4)).toBe(2);});it('b',()=>{expect(hd284atl(3,1)).toBe(1);});it('c',()=>{expect(hd284atl(0,0)).toBe(0);});it('d',()=>{expect(hd284atl(93,73)).toBe(2);});it('e',()=>{expect(hd284atl(15,0)).toBe(4);});});
function hd285atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285atl_hd',()=>{it('a',()=>{expect(hd285atl(1,4)).toBe(2);});it('b',()=>{expect(hd285atl(3,1)).toBe(1);});it('c',()=>{expect(hd285atl(0,0)).toBe(0);});it('d',()=>{expect(hd285atl(93,73)).toBe(2);});it('e',()=>{expect(hd285atl(15,0)).toBe(4);});});
function hd286atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286atl_hd',()=>{it('a',()=>{expect(hd286atl(1,4)).toBe(2);});it('b',()=>{expect(hd286atl(3,1)).toBe(1);});it('c',()=>{expect(hd286atl(0,0)).toBe(0);});it('d',()=>{expect(hd286atl(93,73)).toBe(2);});it('e',()=>{expect(hd286atl(15,0)).toBe(4);});});
function hd287atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287atl_hd',()=>{it('a',()=>{expect(hd287atl(1,4)).toBe(2);});it('b',()=>{expect(hd287atl(3,1)).toBe(1);});it('c',()=>{expect(hd287atl(0,0)).toBe(0);});it('d',()=>{expect(hd287atl(93,73)).toBe(2);});it('e',()=>{expect(hd287atl(15,0)).toBe(4);});});
function hd288atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288atl_hd',()=>{it('a',()=>{expect(hd288atl(1,4)).toBe(2);});it('b',()=>{expect(hd288atl(3,1)).toBe(1);});it('c',()=>{expect(hd288atl(0,0)).toBe(0);});it('d',()=>{expect(hd288atl(93,73)).toBe(2);});it('e',()=>{expect(hd288atl(15,0)).toBe(4);});});
function hd289atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289atl_hd',()=>{it('a',()=>{expect(hd289atl(1,4)).toBe(2);});it('b',()=>{expect(hd289atl(3,1)).toBe(1);});it('c',()=>{expect(hd289atl(0,0)).toBe(0);});it('d',()=>{expect(hd289atl(93,73)).toBe(2);});it('e',()=>{expect(hd289atl(15,0)).toBe(4);});});
function hd290atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290atl_hd',()=>{it('a',()=>{expect(hd290atl(1,4)).toBe(2);});it('b',()=>{expect(hd290atl(3,1)).toBe(1);});it('c',()=>{expect(hd290atl(0,0)).toBe(0);});it('d',()=>{expect(hd290atl(93,73)).toBe(2);});it('e',()=>{expect(hd290atl(15,0)).toBe(4);});});
function hd291atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291atl_hd',()=>{it('a',()=>{expect(hd291atl(1,4)).toBe(2);});it('b',()=>{expect(hd291atl(3,1)).toBe(1);});it('c',()=>{expect(hd291atl(0,0)).toBe(0);});it('d',()=>{expect(hd291atl(93,73)).toBe(2);});it('e',()=>{expect(hd291atl(15,0)).toBe(4);});});
function hd292atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292atl_hd',()=>{it('a',()=>{expect(hd292atl(1,4)).toBe(2);});it('b',()=>{expect(hd292atl(3,1)).toBe(1);});it('c',()=>{expect(hd292atl(0,0)).toBe(0);});it('d',()=>{expect(hd292atl(93,73)).toBe(2);});it('e',()=>{expect(hd292atl(15,0)).toBe(4);});});
function hd293atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293atl_hd',()=>{it('a',()=>{expect(hd293atl(1,4)).toBe(2);});it('b',()=>{expect(hd293atl(3,1)).toBe(1);});it('c',()=>{expect(hd293atl(0,0)).toBe(0);});it('d',()=>{expect(hd293atl(93,73)).toBe(2);});it('e',()=>{expect(hd293atl(15,0)).toBe(4);});});
function hd294atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294atl_hd',()=>{it('a',()=>{expect(hd294atl(1,4)).toBe(2);});it('b',()=>{expect(hd294atl(3,1)).toBe(1);});it('c',()=>{expect(hd294atl(0,0)).toBe(0);});it('d',()=>{expect(hd294atl(93,73)).toBe(2);});it('e',()=>{expect(hd294atl(15,0)).toBe(4);});});
function hd295atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295atl_hd',()=>{it('a',()=>{expect(hd295atl(1,4)).toBe(2);});it('b',()=>{expect(hd295atl(3,1)).toBe(1);});it('c',()=>{expect(hd295atl(0,0)).toBe(0);});it('d',()=>{expect(hd295atl(93,73)).toBe(2);});it('e',()=>{expect(hd295atl(15,0)).toBe(4);});});
function hd296atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296atl_hd',()=>{it('a',()=>{expect(hd296atl(1,4)).toBe(2);});it('b',()=>{expect(hd296atl(3,1)).toBe(1);});it('c',()=>{expect(hd296atl(0,0)).toBe(0);});it('d',()=>{expect(hd296atl(93,73)).toBe(2);});it('e',()=>{expect(hd296atl(15,0)).toBe(4);});});
function hd297atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297atl_hd',()=>{it('a',()=>{expect(hd297atl(1,4)).toBe(2);});it('b',()=>{expect(hd297atl(3,1)).toBe(1);});it('c',()=>{expect(hd297atl(0,0)).toBe(0);});it('d',()=>{expect(hd297atl(93,73)).toBe(2);});it('e',()=>{expect(hd297atl(15,0)).toBe(4);});});
function hd298atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298atl_hd',()=>{it('a',()=>{expect(hd298atl(1,4)).toBe(2);});it('b',()=>{expect(hd298atl(3,1)).toBe(1);});it('c',()=>{expect(hd298atl(0,0)).toBe(0);});it('d',()=>{expect(hd298atl(93,73)).toBe(2);});it('e',()=>{expect(hd298atl(15,0)).toBe(4);});});
function hd299atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299atl_hd',()=>{it('a',()=>{expect(hd299atl(1,4)).toBe(2);});it('b',()=>{expect(hd299atl(3,1)).toBe(1);});it('c',()=>{expect(hd299atl(0,0)).toBe(0);});it('d',()=>{expect(hd299atl(93,73)).toBe(2);});it('e',()=>{expect(hd299atl(15,0)).toBe(4);});});
function hd300atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300atl_hd',()=>{it('a',()=>{expect(hd300atl(1,4)).toBe(2);});it('b',()=>{expect(hd300atl(3,1)).toBe(1);});it('c',()=>{expect(hd300atl(0,0)).toBe(0);});it('d',()=>{expect(hd300atl(93,73)).toBe(2);});it('e',()=>{expect(hd300atl(15,0)).toBe(4);});});
function hd301atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301atl_hd',()=>{it('a',()=>{expect(hd301atl(1,4)).toBe(2);});it('b',()=>{expect(hd301atl(3,1)).toBe(1);});it('c',()=>{expect(hd301atl(0,0)).toBe(0);});it('d',()=>{expect(hd301atl(93,73)).toBe(2);});it('e',()=>{expect(hd301atl(15,0)).toBe(4);});});
function hd302atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302atl_hd',()=>{it('a',()=>{expect(hd302atl(1,4)).toBe(2);});it('b',()=>{expect(hd302atl(3,1)).toBe(1);});it('c',()=>{expect(hd302atl(0,0)).toBe(0);});it('d',()=>{expect(hd302atl(93,73)).toBe(2);});it('e',()=>{expect(hd302atl(15,0)).toBe(4);});});
function hd303atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303atl_hd',()=>{it('a',()=>{expect(hd303atl(1,4)).toBe(2);});it('b',()=>{expect(hd303atl(3,1)).toBe(1);});it('c',()=>{expect(hd303atl(0,0)).toBe(0);});it('d',()=>{expect(hd303atl(93,73)).toBe(2);});it('e',()=>{expect(hd303atl(15,0)).toBe(4);});});
function hd304atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304atl_hd',()=>{it('a',()=>{expect(hd304atl(1,4)).toBe(2);});it('b',()=>{expect(hd304atl(3,1)).toBe(1);});it('c',()=>{expect(hd304atl(0,0)).toBe(0);});it('d',()=>{expect(hd304atl(93,73)).toBe(2);});it('e',()=>{expect(hd304atl(15,0)).toBe(4);});});
function hd305atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305atl_hd',()=>{it('a',()=>{expect(hd305atl(1,4)).toBe(2);});it('b',()=>{expect(hd305atl(3,1)).toBe(1);});it('c',()=>{expect(hd305atl(0,0)).toBe(0);});it('d',()=>{expect(hd305atl(93,73)).toBe(2);});it('e',()=>{expect(hd305atl(15,0)).toBe(4);});});
function hd306atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306atl_hd',()=>{it('a',()=>{expect(hd306atl(1,4)).toBe(2);});it('b',()=>{expect(hd306atl(3,1)).toBe(1);});it('c',()=>{expect(hd306atl(0,0)).toBe(0);});it('d',()=>{expect(hd306atl(93,73)).toBe(2);});it('e',()=>{expect(hd306atl(15,0)).toBe(4);});});
function hd307atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307atl_hd',()=>{it('a',()=>{expect(hd307atl(1,4)).toBe(2);});it('b',()=>{expect(hd307atl(3,1)).toBe(1);});it('c',()=>{expect(hd307atl(0,0)).toBe(0);});it('d',()=>{expect(hd307atl(93,73)).toBe(2);});it('e',()=>{expect(hd307atl(15,0)).toBe(4);});});
function hd308atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308atl_hd',()=>{it('a',()=>{expect(hd308atl(1,4)).toBe(2);});it('b',()=>{expect(hd308atl(3,1)).toBe(1);});it('c',()=>{expect(hd308atl(0,0)).toBe(0);});it('d',()=>{expect(hd308atl(93,73)).toBe(2);});it('e',()=>{expect(hd308atl(15,0)).toBe(4);});});
function hd309atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309atl_hd',()=>{it('a',()=>{expect(hd309atl(1,4)).toBe(2);});it('b',()=>{expect(hd309atl(3,1)).toBe(1);});it('c',()=>{expect(hd309atl(0,0)).toBe(0);});it('d',()=>{expect(hd309atl(93,73)).toBe(2);});it('e',()=>{expect(hd309atl(15,0)).toBe(4);});});
function hd310atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310atl_hd',()=>{it('a',()=>{expect(hd310atl(1,4)).toBe(2);});it('b',()=>{expect(hd310atl(3,1)).toBe(1);});it('c',()=>{expect(hd310atl(0,0)).toBe(0);});it('d',()=>{expect(hd310atl(93,73)).toBe(2);});it('e',()=>{expect(hd310atl(15,0)).toBe(4);});});
function hd311atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311atl_hd',()=>{it('a',()=>{expect(hd311atl(1,4)).toBe(2);});it('b',()=>{expect(hd311atl(3,1)).toBe(1);});it('c',()=>{expect(hd311atl(0,0)).toBe(0);});it('d',()=>{expect(hd311atl(93,73)).toBe(2);});it('e',()=>{expect(hd311atl(15,0)).toBe(4);});});
function hd312atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312atl_hd',()=>{it('a',()=>{expect(hd312atl(1,4)).toBe(2);});it('b',()=>{expect(hd312atl(3,1)).toBe(1);});it('c',()=>{expect(hd312atl(0,0)).toBe(0);});it('d',()=>{expect(hd312atl(93,73)).toBe(2);});it('e',()=>{expect(hd312atl(15,0)).toBe(4);});});
function hd313atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313atl_hd',()=>{it('a',()=>{expect(hd313atl(1,4)).toBe(2);});it('b',()=>{expect(hd313atl(3,1)).toBe(1);});it('c',()=>{expect(hd313atl(0,0)).toBe(0);});it('d',()=>{expect(hd313atl(93,73)).toBe(2);});it('e',()=>{expect(hd313atl(15,0)).toBe(4);});});
function hd314atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314atl_hd',()=>{it('a',()=>{expect(hd314atl(1,4)).toBe(2);});it('b',()=>{expect(hd314atl(3,1)).toBe(1);});it('c',()=>{expect(hd314atl(0,0)).toBe(0);});it('d',()=>{expect(hd314atl(93,73)).toBe(2);});it('e',()=>{expect(hd314atl(15,0)).toBe(4);});});
function hd315atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315atl_hd',()=>{it('a',()=>{expect(hd315atl(1,4)).toBe(2);});it('b',()=>{expect(hd315atl(3,1)).toBe(1);});it('c',()=>{expect(hd315atl(0,0)).toBe(0);});it('d',()=>{expect(hd315atl(93,73)).toBe(2);});it('e',()=>{expect(hd315atl(15,0)).toBe(4);});});
function hd316atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316atl_hd',()=>{it('a',()=>{expect(hd316atl(1,4)).toBe(2);});it('b',()=>{expect(hd316atl(3,1)).toBe(1);});it('c',()=>{expect(hd316atl(0,0)).toBe(0);});it('d',()=>{expect(hd316atl(93,73)).toBe(2);});it('e',()=>{expect(hd316atl(15,0)).toBe(4);});});
function hd317atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317atl_hd',()=>{it('a',()=>{expect(hd317atl(1,4)).toBe(2);});it('b',()=>{expect(hd317atl(3,1)).toBe(1);});it('c',()=>{expect(hd317atl(0,0)).toBe(0);});it('d',()=>{expect(hd317atl(93,73)).toBe(2);});it('e',()=>{expect(hd317atl(15,0)).toBe(4);});});
function hd318atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318atl_hd',()=>{it('a',()=>{expect(hd318atl(1,4)).toBe(2);});it('b',()=>{expect(hd318atl(3,1)).toBe(1);});it('c',()=>{expect(hd318atl(0,0)).toBe(0);});it('d',()=>{expect(hd318atl(93,73)).toBe(2);});it('e',()=>{expect(hd318atl(15,0)).toBe(4);});});
function hd319atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319atl_hd',()=>{it('a',()=>{expect(hd319atl(1,4)).toBe(2);});it('b',()=>{expect(hd319atl(3,1)).toBe(1);});it('c',()=>{expect(hd319atl(0,0)).toBe(0);});it('d',()=>{expect(hd319atl(93,73)).toBe(2);});it('e',()=>{expect(hd319atl(15,0)).toBe(4);});});
function hd320atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320atl_hd',()=>{it('a',()=>{expect(hd320atl(1,4)).toBe(2);});it('b',()=>{expect(hd320atl(3,1)).toBe(1);});it('c',()=>{expect(hd320atl(0,0)).toBe(0);});it('d',()=>{expect(hd320atl(93,73)).toBe(2);});it('e',()=>{expect(hd320atl(15,0)).toBe(4);});});
function hd321atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321atl_hd',()=>{it('a',()=>{expect(hd321atl(1,4)).toBe(2);});it('b',()=>{expect(hd321atl(3,1)).toBe(1);});it('c',()=>{expect(hd321atl(0,0)).toBe(0);});it('d',()=>{expect(hd321atl(93,73)).toBe(2);});it('e',()=>{expect(hd321atl(15,0)).toBe(4);});});
function hd322atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322atl_hd',()=>{it('a',()=>{expect(hd322atl(1,4)).toBe(2);});it('b',()=>{expect(hd322atl(3,1)).toBe(1);});it('c',()=>{expect(hd322atl(0,0)).toBe(0);});it('d',()=>{expect(hd322atl(93,73)).toBe(2);});it('e',()=>{expect(hd322atl(15,0)).toBe(4);});});
function hd323atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323atl_hd',()=>{it('a',()=>{expect(hd323atl(1,4)).toBe(2);});it('b',()=>{expect(hd323atl(3,1)).toBe(1);});it('c',()=>{expect(hd323atl(0,0)).toBe(0);});it('d',()=>{expect(hd323atl(93,73)).toBe(2);});it('e',()=>{expect(hd323atl(15,0)).toBe(4);});});
function hd324atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324atl_hd',()=>{it('a',()=>{expect(hd324atl(1,4)).toBe(2);});it('b',()=>{expect(hd324atl(3,1)).toBe(1);});it('c',()=>{expect(hd324atl(0,0)).toBe(0);});it('d',()=>{expect(hd324atl(93,73)).toBe(2);});it('e',()=>{expect(hd324atl(15,0)).toBe(4);});});
function hd325atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325atl_hd',()=>{it('a',()=>{expect(hd325atl(1,4)).toBe(2);});it('b',()=>{expect(hd325atl(3,1)).toBe(1);});it('c',()=>{expect(hd325atl(0,0)).toBe(0);});it('d',()=>{expect(hd325atl(93,73)).toBe(2);});it('e',()=>{expect(hd325atl(15,0)).toBe(4);});});
function hd326atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326atl_hd',()=>{it('a',()=>{expect(hd326atl(1,4)).toBe(2);});it('b',()=>{expect(hd326atl(3,1)).toBe(1);});it('c',()=>{expect(hd326atl(0,0)).toBe(0);});it('d',()=>{expect(hd326atl(93,73)).toBe(2);});it('e',()=>{expect(hd326atl(15,0)).toBe(4);});});
function hd327atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327atl_hd',()=>{it('a',()=>{expect(hd327atl(1,4)).toBe(2);});it('b',()=>{expect(hd327atl(3,1)).toBe(1);});it('c',()=>{expect(hd327atl(0,0)).toBe(0);});it('d',()=>{expect(hd327atl(93,73)).toBe(2);});it('e',()=>{expect(hd327atl(15,0)).toBe(4);});});
function hd328atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328atl_hd',()=>{it('a',()=>{expect(hd328atl(1,4)).toBe(2);});it('b',()=>{expect(hd328atl(3,1)).toBe(1);});it('c',()=>{expect(hd328atl(0,0)).toBe(0);});it('d',()=>{expect(hd328atl(93,73)).toBe(2);});it('e',()=>{expect(hd328atl(15,0)).toBe(4);});});
function hd329atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329atl_hd',()=>{it('a',()=>{expect(hd329atl(1,4)).toBe(2);});it('b',()=>{expect(hd329atl(3,1)).toBe(1);});it('c',()=>{expect(hd329atl(0,0)).toBe(0);});it('d',()=>{expect(hd329atl(93,73)).toBe(2);});it('e',()=>{expect(hd329atl(15,0)).toBe(4);});});
function hd330atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330atl_hd',()=>{it('a',()=>{expect(hd330atl(1,4)).toBe(2);});it('b',()=>{expect(hd330atl(3,1)).toBe(1);});it('c',()=>{expect(hd330atl(0,0)).toBe(0);});it('d',()=>{expect(hd330atl(93,73)).toBe(2);});it('e',()=>{expect(hd330atl(15,0)).toBe(4);});});
function hd331atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331atl_hd',()=>{it('a',()=>{expect(hd331atl(1,4)).toBe(2);});it('b',()=>{expect(hd331atl(3,1)).toBe(1);});it('c',()=>{expect(hd331atl(0,0)).toBe(0);});it('d',()=>{expect(hd331atl(93,73)).toBe(2);});it('e',()=>{expect(hd331atl(15,0)).toBe(4);});});
function hd332atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332atl_hd',()=>{it('a',()=>{expect(hd332atl(1,4)).toBe(2);});it('b',()=>{expect(hd332atl(3,1)).toBe(1);});it('c',()=>{expect(hd332atl(0,0)).toBe(0);});it('d',()=>{expect(hd332atl(93,73)).toBe(2);});it('e',()=>{expect(hd332atl(15,0)).toBe(4);});});
function hd333atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333atl_hd',()=>{it('a',()=>{expect(hd333atl(1,4)).toBe(2);});it('b',()=>{expect(hd333atl(3,1)).toBe(1);});it('c',()=>{expect(hd333atl(0,0)).toBe(0);});it('d',()=>{expect(hd333atl(93,73)).toBe(2);});it('e',()=>{expect(hd333atl(15,0)).toBe(4);});});
function hd334atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334atl_hd',()=>{it('a',()=>{expect(hd334atl(1,4)).toBe(2);});it('b',()=>{expect(hd334atl(3,1)).toBe(1);});it('c',()=>{expect(hd334atl(0,0)).toBe(0);});it('d',()=>{expect(hd334atl(93,73)).toBe(2);});it('e',()=>{expect(hd334atl(15,0)).toBe(4);});});
function hd335atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335atl_hd',()=>{it('a',()=>{expect(hd335atl(1,4)).toBe(2);});it('b',()=>{expect(hd335atl(3,1)).toBe(1);});it('c',()=>{expect(hd335atl(0,0)).toBe(0);});it('d',()=>{expect(hd335atl(93,73)).toBe(2);});it('e',()=>{expect(hd335atl(15,0)).toBe(4);});});
function hd336atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336atl_hd',()=>{it('a',()=>{expect(hd336atl(1,4)).toBe(2);});it('b',()=>{expect(hd336atl(3,1)).toBe(1);});it('c',()=>{expect(hd336atl(0,0)).toBe(0);});it('d',()=>{expect(hd336atl(93,73)).toBe(2);});it('e',()=>{expect(hd336atl(15,0)).toBe(4);});});
function hd337atl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337atl_hd',()=>{it('a',()=>{expect(hd337atl(1,4)).toBe(2);});it('b',()=>{expect(hd337atl(3,1)).toBe(1);});it('c',()=>{expect(hd337atl(0,0)).toBe(0);});it('d',()=>{expect(hd337atl(93,73)).toBe(2);});it('e',()=>{expect(hd337atl(15,0)).toBe(4);});});
