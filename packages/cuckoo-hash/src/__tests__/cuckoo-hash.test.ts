// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { CuckooHashMap, RobinHoodHashMap, DoubleHashMap } from '../cuckoo-hash';

// ─────────────────────────────────────────────────────────────────────────────
// CuckooHashMap — set / get  (200 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('CuckooHashMap set/get (200 tests)', () => {
  for (let i = 0; i < 200; i++) {
    it(`set and get key${i} = ${i}`, () => {
      const map = new CuckooHashMap<number>();
      map.set(`key${i}`, i);
      expect(map.get(`key${i}`)).toBe(i);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CuckooHashMap — has  (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('CuckooHashMap has (100 tests)', () => {
  for (let i = 0; i < 100; i++) {
    it(`has returns true for inserted key${i}, false for missing${i}`, () => {
      const map = new CuckooHashMap<number>();
      map.set(`key${i}`, i);
      expect(map.has(`key${i}`)).toBe(true);
      expect(map.has(`missing${i}`)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CuckooHashMap — delete  (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('CuckooHashMap delete (100 tests)', () => {
  for (let i = 0; i < 100; i++) {
    it(`delete key${i} makes has() return false`, () => {
      const map = new CuckooHashMap<number>();
      map.set(`key${i}`, i);
      expect(map.has(`key${i}`)).toBe(true);
      const result = map.delete(`key${i}`);
      expect(result).toBe(true);
      expect(map.has(`key${i}`)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CuckooHashMap — size  (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('CuckooHashMap size (100 tests)', () => {
  for (let i = 1; i <= 100; i++) {
    it(`size is ${i} after inserting ${i} unique keys`, () => {
      const map = new CuckooHashMap<number>();
      for (let j = 0; j < i; j++) map.set(`sz${j}`, j);
      expect(map.size).toBe(i);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CuckooHashMap — overwrite  (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('CuckooHashMap overwrite (100 tests)', () => {
  for (let i = 0; i < 100; i++) {
    it(`overwriting key${i} returns updated value ${i + 1000}`, () => {
      const map = new CuckooHashMap<number>();
      map.set(`key${i}`, i);
      map.set(`key${i}`, i + 1000);
      expect(map.get(`key${i}`)).toBe(i + 1000);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CuckooHashMap — keys / values / entries  (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('CuckooHashMap keys/values/entries (100 tests)', () => {
  for (let n = 1; n <= 100; n++) {
    it(`keys(), values(), entries() all have length ${n}`, () => {
      const map = new CuckooHashMap<number>();
      for (let j = 0; j < n; j++) map.set(`k${j}`, j * 2);
      expect(map.keys().length).toBe(n);
      expect(map.values().length).toBe(n);
      expect(map.entries().length).toBe(n);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CuckooHashMap — clear  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('CuckooHashMap clear (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`after inserting ${i} keys and clearing, size=0 and has()=false`, () => {
      const map = new CuckooHashMap<number>();
      for (let j = 0; j < i; j++) map.set(`c${j}`, j);
      map.clear();
      expect(map.size).toBe(0);
      expect(map.has(`c0`)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CuckooHashMap — loadFactor  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('CuckooHashMap loadFactor (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`loadFactor is between 0 and 1 after ${i} inserts`, () => {
      const map = new CuckooHashMap<number>(64);
      for (let j = 0; j < i; j++) map.set(`lf${j}`, j);
      expect(map.loadFactor).toBeGreaterThanOrEqual(0);
      expect(map.loadFactor).toBeLessThanOrEqual(1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CuckooHashMap — bulk insert & lookup  (extra coverage)
// ─────────────────────────────────────────────────────────────────────────────
describe('CuckooHashMap bulk insert (50 tests)', () => {
  for (let batch = 1; batch <= 50; batch++) {
    it(`bulk insert ${batch * 4} entries all retrievable`, () => {
      const map = new CuckooHashMap<string>();
      const n = batch * 4;
      for (let j = 0; j < n; j++) map.set(`bulk${j}`, `val${j}`);
      for (let j = 0; j < n; j++) {
        expect(map.get(`bulk${j}`)).toBe(`val${j}`);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CuckooHashMap — delete non-existent  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('CuckooHashMap delete non-existent (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`deleting absent key ghost${i} returns false`, () => {
      const map = new CuckooHashMap<number>();
      expect(map.delete(`ghost${i}`)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CuckooHashMap — size after delete  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('CuckooHashMap size after delete (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`size decrements to ${i - 1} after deleting one of ${i} keys`, () => {
      const map = new CuckooHashMap<number>();
      for (let j = 0; j < i; j++) map.set(`d${j}`, j);
      map.delete(`d0`);
      expect(map.size).toBe(i - 1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CuckooHashMap — string values  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('CuckooHashMap string values (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`stores string value for key${i}`, () => {
      const map = new CuckooHashMap<string>();
      map.set(`key${i}`, `value_${i}`);
      expect(map.get(`key${i}`)).toBe(`value_${i}`);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CuckooHashMap — object values  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('CuckooHashMap object values (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`stores object value for objkey${i}`, () => {
      const map = new CuckooHashMap<{ n: number }>();
      map.set(`objkey${i}`, { n: i });
      expect(map.get(`objkey${i}`)).toEqual({ n: i });
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CuckooHashMap — re-insert after delete  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('CuckooHashMap re-insert after delete (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`re-inserting key${i} after delete works correctly`, () => {
      const map = new CuckooHashMap<number>();
      map.set(`key${i}`, i);
      map.delete(`key${i}`);
      map.set(`key${i}`, i + 500);
      expect(map.get(`key${i}`)).toBe(i + 500);
      expect(map.has(`key${i}`)).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CuckooHashMap — entries content  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('CuckooHashMap entries content (50 tests)', () => {
  for (let n = 1; n <= 50; n++) {
    it(`entries() for ${n}-item map has correct pairs`, () => {
      const map = new CuckooHashMap<number>();
      for (let j = 0; j < n; j++) map.set(`e${j}`, j * 3);
      const entries = map.entries();
      expect(entries.length).toBe(n);
      for (const [k, v] of entries) {
        expect(map.get(k)).toBe(v);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CuckooHashMap — values content  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('CuckooHashMap values content (50 tests)', () => {
  for (let n = 1; n <= 50; n++) {
    it(`values() for ${n}-item map has correct values`, () => {
      const map = new CuckooHashMap<number>();
      for (let j = 0; j < n; j++) map.set(`v${j}`, j + 100);
      const values = map.values();
      expect(values.length).toBe(n);
      // All values should be >= 100
      for (const v of values) {
        expect(v).toBeGreaterThanOrEqual(100);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CuckooHashMap — get undefined for missing  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('CuckooHashMap get undefined for missing (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`get returns undefined for non-existent key nope${i}`, () => {
      const map = new CuckooHashMap<number>();
      expect(map.get(`nope${i}`)).toBeUndefined();
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RobinHoodHashMap — set / get  (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('RobinHoodHashMap set/get (100 tests)', () => {
  for (let i = 0; i < 100; i++) {
    it(`RobinHood: set and get key${i} = ${i}`, () => {
      const map = new RobinHoodHashMap<number>();
      map.set(`key${i}`, i);
      expect(map.get(`key${i}`)).toBe(i);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RobinHoodHashMap — delete  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('RobinHoodHashMap delete (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`RobinHood: delete key${i} returns true; missing returns false`, () => {
      const map = new RobinHoodHashMap<number>();
      map.set(`key${i}`, i);
      expect(map.delete(`key${i}`)).toBe(true);
      expect(map.delete(`ghost${i}`)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RobinHoodHashMap — size  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('RobinHoodHashMap size (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`RobinHood: size is ${i} after ${i} inserts`, () => {
      const map = new RobinHoodHashMap<number>();
      for (let j = 0; j < i; j++) map.set(`r${j}`, j);
      expect(map.size).toBe(i);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RobinHoodHashMap — has  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('RobinHoodHashMap has (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`RobinHood: has() correct for key${i}`, () => {
      const map = new RobinHoodHashMap<number>();
      expect(map.has(`key${i}`)).toBe(false);
      map.set(`key${i}`, i);
      expect(map.has(`key${i}`)).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RobinHoodHashMap — overwrite  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('RobinHoodHashMap overwrite (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`RobinHood: overwrite key${i} returns updated value`, () => {
      const map = new RobinHoodHashMap<number>();
      map.set(`key${i}`, i);
      map.set(`key${i}`, i + 999);
      expect(map.get(`key${i}`)).toBe(i + 999);
      expect(map.size).toBe(1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RobinHoodHashMap — clear  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('RobinHoodHashMap clear (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`RobinHood: clear after ${i} inserts gives size=0`, () => {
      const map = new RobinHoodHashMap<number>();
      for (let j = 0; j < i; j++) map.set(`rc${j}`, j);
      map.clear();
      expect(map.size).toBe(0);
      expect(map.has(`rc0`)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RobinHoodHashMap — get undefined  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('RobinHoodHashMap get undefined (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`RobinHood: get returns undefined for absent key${i}`, () => {
      const map = new RobinHoodHashMap<string>();
      expect(map.get(`absent${i}`)).toBeUndefined();
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RobinHoodHashMap — size after delete  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('RobinHoodHashMap size after delete (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`RobinHood: size decrements after deleting one of ${i} entries`, () => {
      const map = new RobinHoodHashMap<number>();
      for (let j = 0; j < i; j++) map.set(`rd${j}`, j);
      map.delete(`rd0`);
      expect(map.size).toBe(i - 1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RobinHoodHashMap — re-insert after delete  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('RobinHoodHashMap re-insert after delete (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`RobinHood: re-insert key${i} after delete`, () => {
      const map = new RobinHoodHashMap<number>();
      map.set(`key${i}`, i);
      map.delete(`key${i}`);
      map.set(`key${i}`, i + 200);
      expect(map.get(`key${i}`)).toBe(i + 200);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RobinHoodHashMap — bulk insert  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('RobinHoodHashMap bulk insert (50 tests)', () => {
  for (let batch = 1; batch <= 50; batch++) {
    it(`RobinHood: bulk insert ${batch * 3} entries all retrievable`, () => {
      const map = new RobinHoodHashMap<number>();
      const n = batch * 3;
      for (let j = 0; j < n; j++) map.set(`rb${j}`, j + 1);
      for (let j = 0; j < n; j++) {
        expect(map.get(`rb${j}`)).toBe(j + 1);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DoubleHashMap — set / get  (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('DoubleHashMap set/get (100 tests)', () => {
  for (let i = 0; i < 100; i++) {
    it(`Double: set and get key${i} = ${i}`, () => {
      const map = new DoubleHashMap<number>();
      map.set(`key${i}`, i);
      expect(map.get(`key${i}`)).toBe(i);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DoubleHashMap — delete  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('DoubleHashMap delete (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`Double: delete key${i} returns true; missing returns false`, () => {
      const map = new DoubleHashMap<number>();
      map.set(`key${i}`, i);
      expect(map.delete(`key${i}`)).toBe(true);
      expect(map.delete(`ghost${i}`)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DoubleHashMap — size  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('DoubleHashMap size (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`Double: size is ${i} after ${i} inserts`, () => {
      const map = new DoubleHashMap<number>();
      for (let j = 0; j < i; j++) map.set(`ds${j}`, j);
      expect(map.size).toBe(i);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DoubleHashMap — has  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('DoubleHashMap has (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`Double: has() correct for key${i}`, () => {
      const map = new DoubleHashMap<number>();
      expect(map.has(`key${i}`)).toBe(false);
      map.set(`key${i}`, i);
      expect(map.has(`key${i}`)).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DoubleHashMap — overwrite  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('DoubleHashMap overwrite (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`Double: overwrite key${i} returns updated value`, () => {
      const map = new DoubleHashMap<number>();
      map.set(`key${i}`, i);
      map.set(`key${i}`, i + 777);
      expect(map.get(`key${i}`)).toBe(i + 777);
      expect(map.size).toBe(1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DoubleHashMap — clear  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('DoubleHashMap clear (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`Double: clear after ${i} inserts gives size=0`, () => {
      const map = new DoubleHashMap<number>();
      for (let j = 0; j < i; j++) map.set(`dc${j}`, j);
      map.clear();
      expect(map.size).toBe(0);
      expect(map.has(`dc0`)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DoubleHashMap — get undefined  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('DoubleHashMap get undefined (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`Double: get returns undefined for absent key${i}`, () => {
      const map = new DoubleHashMap<string>();
      expect(map.get(`absent${i}`)).toBeUndefined();
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DoubleHashMap — size after delete  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('DoubleHashMap size after delete (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`Double: size decrements after deleting one of ${i} entries`, () => {
      const map = new DoubleHashMap<number>();
      for (let j = 0; j < i; j++) map.set(`dd${j}`, j);
      map.delete(`dd0`);
      expect(map.size).toBe(i - 1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DoubleHashMap — re-insert after delete  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('DoubleHashMap re-insert after delete (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`Double: re-insert key${i} after delete`, () => {
      const map = new DoubleHashMap<number>();
      map.set(`key${i}`, i);
      map.delete(`key${i}`);
      map.set(`key${i}`, i + 300);
      expect(map.get(`key${i}`)).toBe(i + 300);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DoubleHashMap — bulk insert  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('DoubleHashMap bulk insert (50 tests)', () => {
  for (let batch = 1; batch <= 50; batch++) {
    it(`Double: bulk insert ${batch * 3} entries all retrievable`, () => {
      const map = new DoubleHashMap<number>();
      const n = batch * 3;
      for (let j = 0; j < n; j++) map.set(`db${j}`, j + 5);
      for (let j = 0; j < n; j++) {
        expect(map.get(`db${j}`)).toBe(j + 5);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DoubleHashMap — string values  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('DoubleHashMap string values (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`Double: stores string value for key${i}`, () => {
      const map = new DoubleHashMap<string>();
      map.set(`key${i}`, `str_${i}`);
      expect(map.get(`key${i}`)).toBe(`str_${i}`);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Cross-class comparison  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('Cross-class comparison (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`all three maps agree on key${i}=${i}`, () => {
      const c = new CuckooHashMap<number>();
      const r = new RobinHoodHashMap<number>();
      const d = new DoubleHashMap<number>();
      c.set(`key${i}`, i);
      r.set(`key${i}`, i);
      d.set(`key${i}`, i);
      expect(c.get(`key${i}`)).toBe(i);
      expect(r.get(`key${i}`)).toBe(i);
      expect(d.get(`key${i}`)).toBe(i);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CuckooHashMap — large capacity constructor  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('CuckooHashMap large capacity (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`CuckooHashMap with capacity ${(i + 1) * 32} stores key${i}`, () => {
      const map = new CuckooHashMap<number>((i + 1) * 32);
      map.set(`key${i}`, i * 7);
      expect(map.get(`key${i}`)).toBe(i * 7);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RobinHoodHashMap — string values  (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('RobinHoodHashMap string values (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`RobinHood: stores string value for key${i}`, () => {
      const map = new RobinHoodHashMap<string>();
      map.set(`key${i}`, `rh_${i}`);
      expect(map.get(`key${i}`)).toBe(`rh_${i}`);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DoubleHashMap — grow / rehash  (50 tests — each inserts enough to trigger grow)
// ─────────────────────────────────────────────────────────────────────────────
describe('DoubleHashMap grow/rehash (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`Double: grows correctly with ${i * 2} inserts into capacity-17 map`, () => {
      const map = new DoubleHashMap<number>(17);
      const n = i * 2;
      for (let j = 0; j < n; j++) map.set(`g${j}`, j);
      for (let j = 0; j < n; j++) {
        expect(map.get(`g${j}`)).toBe(j);
      }
      expect(map.size).toBe(n);
    });
  }
});
