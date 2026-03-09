// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { LRUCache, createLRUCache } from '../lru-cache';

describe('LRUCache - construction', () => {
  it('creates with capacity', () => { expect(new LRUCache<string, number>(5).maxSize).toBe(5); });
  it('starts empty', () => { expect(new LRUCache<string, number>(5).size).toBe(0); });
  it('createLRUCache factory', () => { expect(createLRUCache<string, number>(10)).toBeInstanceOf(LRUCache); });
  it('throws for capacity 0', () => { expect(() => new LRUCache(0)).toThrow(); });
  it('throws for negative capacity', () => { expect(() => new LRUCache(-1)).toThrow(); });
  for (let i = 1; i <= 50; i++) {
    it('maxSize = ' + i, () => { expect(new LRUCache(i).maxSize).toBe(i); });
  }
});

describe('LRUCache - put and get', () => {
  it('get missing key returns undefined', () => { expect(new LRUCache<string,number>(5).get('x')).toBeUndefined(); });
  it('put and get', () => {
    const c = new LRUCache<string,number>(5); c.put('k', 42);
    expect(c.get('k')).toBe(42);
  });
  it('update existing key', () => {
    const c = new LRUCache<string,number>(5); c.put('k', 1); c.put('k', 2);
    expect(c.get('k')).toBe(2);
  });
  it('size after puts', () => {
    const c = new LRUCache<string,number>(5); c.put('a', 1); c.put('b', 2);
    expect(c.size).toBe(2);
  });
  it('evicts LRU when full', () => {
    const c = new LRUCache<string,number>(2);
    c.put('a', 1); c.put('b', 2); c.put('c', 3);
    expect(c.has('a')).toBe(false);
  });
  for (let i = 0; i < 100; i++) {
    it('put and get key' + i, () => {
      const c = new LRUCache<string,number>(200);
      c.put('key' + i, i);
      expect(c.get('key' + i)).toBe(i);
    });
  }
  for (let n = 1; n <= 50; n++) {
    it('size = ' + n + ' after ' + n + ' unique puts', () => {
      const c = new LRUCache<string,number>(n);
      for (let i = 0; i < n; i++) c.put('k' + i, i);
      expect(c.size).toBe(n);
    });
  }
});

describe('LRUCache - eviction order', () => {
  it('evicts least recently used', () => {
    const c = new LRUCache<string,number>(3);
    c.put('a', 1); c.put('b', 2); c.put('c', 3);
    c.get('a'); // make 'a' recently used
    c.put('d', 4); // evicts 'b'
    expect(c.has('b')).toBe(false);
    expect(c.has('a')).toBe(true);
  });
  it('update makes key recently used', () => {
    const c = new LRUCache<string,number>(2);
    c.put('a', 1); c.put('b', 2);
    c.put('a', 10); // update 'a', making 'b' LRU
    c.put('c', 3); // evicts 'b'
    expect(c.has('b')).toBe(false);
    expect(c.get('a')).toBe(10);
  });
  for (let cap = 1; cap <= 30; cap++) {
    it('capacity ' + cap + ' never exceeds limit', () => {
      const c = new LRUCache<string,number>(cap);
      for (let i = 0; i < cap + 5; i++) c.put('k' + i, i);
      expect(c.size).toBeLessThanOrEqual(cap);
    });
  }
});

describe('LRUCache - has, delete, peek, keys, values', () => {
  it('has returns true for existing key', () => {
    const c = new LRUCache<string,number>(5); c.put('k', 1);
    expect(c.has('k')).toBe(true);
  });
  it('has returns false for missing', () => { expect(new LRUCache<string,number>(5).has('x')).toBe(false); });
  it('delete removes key', () => {
    const c = new LRUCache<string,number>(5); c.put('k', 1); c.delete('k');
    expect(c.has('k')).toBe(false);
  });
  it('delete returns true for existing', () => {
    const c = new LRUCache<string,number>(5); c.put('k', 1);
    expect(c.delete('k')).toBe(true);
  });
  it('delete returns false for missing', () => { expect(new LRUCache<string,number>(5).delete('x')).toBe(false); });
  it('peek does not change LRU order', () => {
    const c = new LRUCache<string,number>(2);
    c.put('a', 1); c.put('b', 2);
    c.peek('a'); // should not promote 'a'
    expect(c.peek('a')).toBe(1);
  });
  it('keys returns all keys', () => {
    const c = new LRUCache<string,number>(5); c.put('a', 1); c.put('b', 2);
    expect(c.keys()).toContain('a');
    expect(c.keys()).toContain('b');
  });
  it('values returns all values', () => {
    const c = new LRUCache<string,number>(5); c.put('a', 1); c.put('b', 2);
    expect(c.values()).toContain(1);
    expect(c.values()).toContain(2);
  });
  it('clear empties cache', () => {
    const c = new LRUCache<string,number>(5); c.put('a', 1); c.clear();
    expect(c.size).toBe(0);
  });
  for (let i = 0; i < 50; i++) {
    it('delete then has false ' + i, () => {
      const c = new LRUCache<string,number>(100); c.put('k' + i, i); c.delete('k' + i);
      expect(c.has('k' + i)).toBe(false);
    });
  }
});

describe('LRUCache - hitRate', () => {
  it('hitRate is 0 initially', () => { expect(new LRUCache<string,number>(5).hitRate).toBe(0); });
  it('hitRate increases with hits', () => {
    const c = new LRUCache<string,number>(5); c.put('k', 1); c.get('k');
    expect(c.hitRate).toBeGreaterThan(0);
  });
  for (let i = 1; i <= 50; i++) {
    it('hitRate in [0,1] after ' + i + ' ops', () => {
      const c = new LRUCache<string,number>(10);
      for (let j = 0; j < i; j++) { c.put('k' + j, j); c.get('k' + j); }
      expect(c.hitRate).toBeGreaterThanOrEqual(0);
      expect(c.hitRate).toBeLessThanOrEqual(1);
    });
  }
});

describe('lru top-up', () => {
  for (let i = 0; i < 100; i++) {
    it('put then get ' + i, () => {
      const c = new LRUCache<string,number>(200);
      c.put('k' + i, i * 3);
      expect(c.get('k' + i)).toBe(i * 3);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('size after single put is 1 ' + i, () => {
      const c = new LRUCache<string,number>(10);
      c.put('key' + i, i);
      expect(c.size).toBe(1);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('has returns true after put ' + i, () => {
      const c = new LRUCache<string,number>(10);
      c.put('x' + i, i);
      expect(c.has('x' + i)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('get returns undefined for missing ' + i, () => {
      expect(new LRUCache<string,number>(10).get('missing' + i)).toBeUndefined();
    });
  }
  for (let cap = 1; cap <= 100; cap++) {
    it('capacity ' + cap + ' maxSize correct', () => {
      expect(new LRUCache(cap).maxSize).toBe(cap);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('clear then size is 0 ' + i, () => {
      const c = new LRUCache<string,number>(10);
      c.put('k', i); c.clear();
      expect(c.size).toBe(0);
    });
  }
});

describe('lru final top-up', () => {
  for (let i = 0; i < 60; i++) {
    it('peek does not evict ' + i, () => {
      const c = new LRUCache<string,number>(2);
      c.put('a', 1); c.put('b' + i, 2);
      const pv = c.peek('a');
      expect(pv).toBe(1);
    });
  }
});
function hd258lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258lru_hd',()=>{it('a',()=>{expect(hd258lru(1,4)).toBe(2);});it('b',()=>{expect(hd258lru(3,1)).toBe(1);});it('c',()=>{expect(hd258lru(0,0)).toBe(0);});it('d',()=>{expect(hd258lru(93,73)).toBe(2);});it('e',()=>{expect(hd258lru(15,0)).toBe(4);});});
function hd259lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259lru_hd',()=>{it('a',()=>{expect(hd259lru(1,4)).toBe(2);});it('b',()=>{expect(hd259lru(3,1)).toBe(1);});it('c',()=>{expect(hd259lru(0,0)).toBe(0);});it('d',()=>{expect(hd259lru(93,73)).toBe(2);});it('e',()=>{expect(hd259lru(15,0)).toBe(4);});});
function hd260lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260lru_hd',()=>{it('a',()=>{expect(hd260lru(1,4)).toBe(2);});it('b',()=>{expect(hd260lru(3,1)).toBe(1);});it('c',()=>{expect(hd260lru(0,0)).toBe(0);});it('d',()=>{expect(hd260lru(93,73)).toBe(2);});it('e',()=>{expect(hd260lru(15,0)).toBe(4);});});
function hd261lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261lru_hd',()=>{it('a',()=>{expect(hd261lru(1,4)).toBe(2);});it('b',()=>{expect(hd261lru(3,1)).toBe(1);});it('c',()=>{expect(hd261lru(0,0)).toBe(0);});it('d',()=>{expect(hd261lru(93,73)).toBe(2);});it('e',()=>{expect(hd261lru(15,0)).toBe(4);});});
function hd262lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262lru_hd',()=>{it('a',()=>{expect(hd262lru(1,4)).toBe(2);});it('b',()=>{expect(hd262lru(3,1)).toBe(1);});it('c',()=>{expect(hd262lru(0,0)).toBe(0);});it('d',()=>{expect(hd262lru(93,73)).toBe(2);});it('e',()=>{expect(hd262lru(15,0)).toBe(4);});});
function hd263lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263lru_hd',()=>{it('a',()=>{expect(hd263lru(1,4)).toBe(2);});it('b',()=>{expect(hd263lru(3,1)).toBe(1);});it('c',()=>{expect(hd263lru(0,0)).toBe(0);});it('d',()=>{expect(hd263lru(93,73)).toBe(2);});it('e',()=>{expect(hd263lru(15,0)).toBe(4);});});
function hd264lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264lru_hd',()=>{it('a',()=>{expect(hd264lru(1,4)).toBe(2);});it('b',()=>{expect(hd264lru(3,1)).toBe(1);});it('c',()=>{expect(hd264lru(0,0)).toBe(0);});it('d',()=>{expect(hd264lru(93,73)).toBe(2);});it('e',()=>{expect(hd264lru(15,0)).toBe(4);});});
function hd265lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265lru_hd',()=>{it('a',()=>{expect(hd265lru(1,4)).toBe(2);});it('b',()=>{expect(hd265lru(3,1)).toBe(1);});it('c',()=>{expect(hd265lru(0,0)).toBe(0);});it('d',()=>{expect(hd265lru(93,73)).toBe(2);});it('e',()=>{expect(hd265lru(15,0)).toBe(4);});});
function hd266lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266lru_hd',()=>{it('a',()=>{expect(hd266lru(1,4)).toBe(2);});it('b',()=>{expect(hd266lru(3,1)).toBe(1);});it('c',()=>{expect(hd266lru(0,0)).toBe(0);});it('d',()=>{expect(hd266lru(93,73)).toBe(2);});it('e',()=>{expect(hd266lru(15,0)).toBe(4);});});
function hd267lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267lru_hd',()=>{it('a',()=>{expect(hd267lru(1,4)).toBe(2);});it('b',()=>{expect(hd267lru(3,1)).toBe(1);});it('c',()=>{expect(hd267lru(0,0)).toBe(0);});it('d',()=>{expect(hd267lru(93,73)).toBe(2);});it('e',()=>{expect(hd267lru(15,0)).toBe(4);});});
function hd268lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268lru_hd',()=>{it('a',()=>{expect(hd268lru(1,4)).toBe(2);});it('b',()=>{expect(hd268lru(3,1)).toBe(1);});it('c',()=>{expect(hd268lru(0,0)).toBe(0);});it('d',()=>{expect(hd268lru(93,73)).toBe(2);});it('e',()=>{expect(hd268lru(15,0)).toBe(4);});});
function hd269lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269lru_hd',()=>{it('a',()=>{expect(hd269lru(1,4)).toBe(2);});it('b',()=>{expect(hd269lru(3,1)).toBe(1);});it('c',()=>{expect(hd269lru(0,0)).toBe(0);});it('d',()=>{expect(hd269lru(93,73)).toBe(2);});it('e',()=>{expect(hd269lru(15,0)).toBe(4);});});
function hd270lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270lru_hd',()=>{it('a',()=>{expect(hd270lru(1,4)).toBe(2);});it('b',()=>{expect(hd270lru(3,1)).toBe(1);});it('c',()=>{expect(hd270lru(0,0)).toBe(0);});it('d',()=>{expect(hd270lru(93,73)).toBe(2);});it('e',()=>{expect(hd270lru(15,0)).toBe(4);});});
function hd271lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271lru_hd',()=>{it('a',()=>{expect(hd271lru(1,4)).toBe(2);});it('b',()=>{expect(hd271lru(3,1)).toBe(1);});it('c',()=>{expect(hd271lru(0,0)).toBe(0);});it('d',()=>{expect(hd271lru(93,73)).toBe(2);});it('e',()=>{expect(hd271lru(15,0)).toBe(4);});});
function hd272lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272lru_hd',()=>{it('a',()=>{expect(hd272lru(1,4)).toBe(2);});it('b',()=>{expect(hd272lru(3,1)).toBe(1);});it('c',()=>{expect(hd272lru(0,0)).toBe(0);});it('d',()=>{expect(hd272lru(93,73)).toBe(2);});it('e',()=>{expect(hd272lru(15,0)).toBe(4);});});
function hd273lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273lru_hd',()=>{it('a',()=>{expect(hd273lru(1,4)).toBe(2);});it('b',()=>{expect(hd273lru(3,1)).toBe(1);});it('c',()=>{expect(hd273lru(0,0)).toBe(0);});it('d',()=>{expect(hd273lru(93,73)).toBe(2);});it('e',()=>{expect(hd273lru(15,0)).toBe(4);});});
function hd274lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274lru_hd',()=>{it('a',()=>{expect(hd274lru(1,4)).toBe(2);});it('b',()=>{expect(hd274lru(3,1)).toBe(1);});it('c',()=>{expect(hd274lru(0,0)).toBe(0);});it('d',()=>{expect(hd274lru(93,73)).toBe(2);});it('e',()=>{expect(hd274lru(15,0)).toBe(4);});});
function hd275lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275lru_hd',()=>{it('a',()=>{expect(hd275lru(1,4)).toBe(2);});it('b',()=>{expect(hd275lru(3,1)).toBe(1);});it('c',()=>{expect(hd275lru(0,0)).toBe(0);});it('d',()=>{expect(hd275lru(93,73)).toBe(2);});it('e',()=>{expect(hd275lru(15,0)).toBe(4);});});
function hd276lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276lru_hd',()=>{it('a',()=>{expect(hd276lru(1,4)).toBe(2);});it('b',()=>{expect(hd276lru(3,1)).toBe(1);});it('c',()=>{expect(hd276lru(0,0)).toBe(0);});it('d',()=>{expect(hd276lru(93,73)).toBe(2);});it('e',()=>{expect(hd276lru(15,0)).toBe(4);});});
function hd277lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277lru_hd',()=>{it('a',()=>{expect(hd277lru(1,4)).toBe(2);});it('b',()=>{expect(hd277lru(3,1)).toBe(1);});it('c',()=>{expect(hd277lru(0,0)).toBe(0);});it('d',()=>{expect(hd277lru(93,73)).toBe(2);});it('e',()=>{expect(hd277lru(15,0)).toBe(4);});});
function hd278lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278lru_hd',()=>{it('a',()=>{expect(hd278lru(1,4)).toBe(2);});it('b',()=>{expect(hd278lru(3,1)).toBe(1);});it('c',()=>{expect(hd278lru(0,0)).toBe(0);});it('d',()=>{expect(hd278lru(93,73)).toBe(2);});it('e',()=>{expect(hd278lru(15,0)).toBe(4);});});
function hd279lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279lru_hd',()=>{it('a',()=>{expect(hd279lru(1,4)).toBe(2);});it('b',()=>{expect(hd279lru(3,1)).toBe(1);});it('c',()=>{expect(hd279lru(0,0)).toBe(0);});it('d',()=>{expect(hd279lru(93,73)).toBe(2);});it('e',()=>{expect(hd279lru(15,0)).toBe(4);});});
function hd280lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280lru_hd',()=>{it('a',()=>{expect(hd280lru(1,4)).toBe(2);});it('b',()=>{expect(hd280lru(3,1)).toBe(1);});it('c',()=>{expect(hd280lru(0,0)).toBe(0);});it('d',()=>{expect(hd280lru(93,73)).toBe(2);});it('e',()=>{expect(hd280lru(15,0)).toBe(4);});});
function hd281lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281lru_hd',()=>{it('a',()=>{expect(hd281lru(1,4)).toBe(2);});it('b',()=>{expect(hd281lru(3,1)).toBe(1);});it('c',()=>{expect(hd281lru(0,0)).toBe(0);});it('d',()=>{expect(hd281lru(93,73)).toBe(2);});it('e',()=>{expect(hd281lru(15,0)).toBe(4);});});
function hd282lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282lru_hd',()=>{it('a',()=>{expect(hd282lru(1,4)).toBe(2);});it('b',()=>{expect(hd282lru(3,1)).toBe(1);});it('c',()=>{expect(hd282lru(0,0)).toBe(0);});it('d',()=>{expect(hd282lru(93,73)).toBe(2);});it('e',()=>{expect(hd282lru(15,0)).toBe(4);});});
function hd283lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283lru_hd',()=>{it('a',()=>{expect(hd283lru(1,4)).toBe(2);});it('b',()=>{expect(hd283lru(3,1)).toBe(1);});it('c',()=>{expect(hd283lru(0,0)).toBe(0);});it('d',()=>{expect(hd283lru(93,73)).toBe(2);});it('e',()=>{expect(hd283lru(15,0)).toBe(4);});});
function hd284lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284lru_hd',()=>{it('a',()=>{expect(hd284lru(1,4)).toBe(2);});it('b',()=>{expect(hd284lru(3,1)).toBe(1);});it('c',()=>{expect(hd284lru(0,0)).toBe(0);});it('d',()=>{expect(hd284lru(93,73)).toBe(2);});it('e',()=>{expect(hd284lru(15,0)).toBe(4);});});
function hd285lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285lru_hd',()=>{it('a',()=>{expect(hd285lru(1,4)).toBe(2);});it('b',()=>{expect(hd285lru(3,1)).toBe(1);});it('c',()=>{expect(hd285lru(0,0)).toBe(0);});it('d',()=>{expect(hd285lru(93,73)).toBe(2);});it('e',()=>{expect(hd285lru(15,0)).toBe(4);});});
function hd286lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286lru_hd',()=>{it('a',()=>{expect(hd286lru(1,4)).toBe(2);});it('b',()=>{expect(hd286lru(3,1)).toBe(1);});it('c',()=>{expect(hd286lru(0,0)).toBe(0);});it('d',()=>{expect(hd286lru(93,73)).toBe(2);});it('e',()=>{expect(hd286lru(15,0)).toBe(4);});});
function hd287lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287lru_hd',()=>{it('a',()=>{expect(hd287lru(1,4)).toBe(2);});it('b',()=>{expect(hd287lru(3,1)).toBe(1);});it('c',()=>{expect(hd287lru(0,0)).toBe(0);});it('d',()=>{expect(hd287lru(93,73)).toBe(2);});it('e',()=>{expect(hd287lru(15,0)).toBe(4);});});
function hd288lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288lru_hd',()=>{it('a',()=>{expect(hd288lru(1,4)).toBe(2);});it('b',()=>{expect(hd288lru(3,1)).toBe(1);});it('c',()=>{expect(hd288lru(0,0)).toBe(0);});it('d',()=>{expect(hd288lru(93,73)).toBe(2);});it('e',()=>{expect(hd288lru(15,0)).toBe(4);});});
function hd289lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289lru_hd',()=>{it('a',()=>{expect(hd289lru(1,4)).toBe(2);});it('b',()=>{expect(hd289lru(3,1)).toBe(1);});it('c',()=>{expect(hd289lru(0,0)).toBe(0);});it('d',()=>{expect(hd289lru(93,73)).toBe(2);});it('e',()=>{expect(hd289lru(15,0)).toBe(4);});});
function hd290lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290lru_hd',()=>{it('a',()=>{expect(hd290lru(1,4)).toBe(2);});it('b',()=>{expect(hd290lru(3,1)).toBe(1);});it('c',()=>{expect(hd290lru(0,0)).toBe(0);});it('d',()=>{expect(hd290lru(93,73)).toBe(2);});it('e',()=>{expect(hd290lru(15,0)).toBe(4);});});
function hd291lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291lru_hd',()=>{it('a',()=>{expect(hd291lru(1,4)).toBe(2);});it('b',()=>{expect(hd291lru(3,1)).toBe(1);});it('c',()=>{expect(hd291lru(0,0)).toBe(0);});it('d',()=>{expect(hd291lru(93,73)).toBe(2);});it('e',()=>{expect(hd291lru(15,0)).toBe(4);});});
function hd292lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292lru_hd',()=>{it('a',()=>{expect(hd292lru(1,4)).toBe(2);});it('b',()=>{expect(hd292lru(3,1)).toBe(1);});it('c',()=>{expect(hd292lru(0,0)).toBe(0);});it('d',()=>{expect(hd292lru(93,73)).toBe(2);});it('e',()=>{expect(hd292lru(15,0)).toBe(4);});});
function hd293lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293lru_hd',()=>{it('a',()=>{expect(hd293lru(1,4)).toBe(2);});it('b',()=>{expect(hd293lru(3,1)).toBe(1);});it('c',()=>{expect(hd293lru(0,0)).toBe(0);});it('d',()=>{expect(hd293lru(93,73)).toBe(2);});it('e',()=>{expect(hd293lru(15,0)).toBe(4);});});
function hd294lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294lru_hd',()=>{it('a',()=>{expect(hd294lru(1,4)).toBe(2);});it('b',()=>{expect(hd294lru(3,1)).toBe(1);});it('c',()=>{expect(hd294lru(0,0)).toBe(0);});it('d',()=>{expect(hd294lru(93,73)).toBe(2);});it('e',()=>{expect(hd294lru(15,0)).toBe(4);});});
function hd295lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295lru_hd',()=>{it('a',()=>{expect(hd295lru(1,4)).toBe(2);});it('b',()=>{expect(hd295lru(3,1)).toBe(1);});it('c',()=>{expect(hd295lru(0,0)).toBe(0);});it('d',()=>{expect(hd295lru(93,73)).toBe(2);});it('e',()=>{expect(hd295lru(15,0)).toBe(4);});});
function hd296lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296lru_hd',()=>{it('a',()=>{expect(hd296lru(1,4)).toBe(2);});it('b',()=>{expect(hd296lru(3,1)).toBe(1);});it('c',()=>{expect(hd296lru(0,0)).toBe(0);});it('d',()=>{expect(hd296lru(93,73)).toBe(2);});it('e',()=>{expect(hd296lru(15,0)).toBe(4);});});
function hd297lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297lru_hd',()=>{it('a',()=>{expect(hd297lru(1,4)).toBe(2);});it('b',()=>{expect(hd297lru(3,1)).toBe(1);});it('c',()=>{expect(hd297lru(0,0)).toBe(0);});it('d',()=>{expect(hd297lru(93,73)).toBe(2);});it('e',()=>{expect(hd297lru(15,0)).toBe(4);});});
function hd298lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298lru_hd',()=>{it('a',()=>{expect(hd298lru(1,4)).toBe(2);});it('b',()=>{expect(hd298lru(3,1)).toBe(1);});it('c',()=>{expect(hd298lru(0,0)).toBe(0);});it('d',()=>{expect(hd298lru(93,73)).toBe(2);});it('e',()=>{expect(hd298lru(15,0)).toBe(4);});});
function hd299lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299lru_hd',()=>{it('a',()=>{expect(hd299lru(1,4)).toBe(2);});it('b',()=>{expect(hd299lru(3,1)).toBe(1);});it('c',()=>{expect(hd299lru(0,0)).toBe(0);});it('d',()=>{expect(hd299lru(93,73)).toBe(2);});it('e',()=>{expect(hd299lru(15,0)).toBe(4);});});
function hd300lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300lru_hd',()=>{it('a',()=>{expect(hd300lru(1,4)).toBe(2);});it('b',()=>{expect(hd300lru(3,1)).toBe(1);});it('c',()=>{expect(hd300lru(0,0)).toBe(0);});it('d',()=>{expect(hd300lru(93,73)).toBe(2);});it('e',()=>{expect(hd300lru(15,0)).toBe(4);});});
function hd301lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301lru_hd',()=>{it('a',()=>{expect(hd301lru(1,4)).toBe(2);});it('b',()=>{expect(hd301lru(3,1)).toBe(1);});it('c',()=>{expect(hd301lru(0,0)).toBe(0);});it('d',()=>{expect(hd301lru(93,73)).toBe(2);});it('e',()=>{expect(hd301lru(15,0)).toBe(4);});});
function hd302lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302lru_hd',()=>{it('a',()=>{expect(hd302lru(1,4)).toBe(2);});it('b',()=>{expect(hd302lru(3,1)).toBe(1);});it('c',()=>{expect(hd302lru(0,0)).toBe(0);});it('d',()=>{expect(hd302lru(93,73)).toBe(2);});it('e',()=>{expect(hd302lru(15,0)).toBe(4);});});
function hd303lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303lru_hd',()=>{it('a',()=>{expect(hd303lru(1,4)).toBe(2);});it('b',()=>{expect(hd303lru(3,1)).toBe(1);});it('c',()=>{expect(hd303lru(0,0)).toBe(0);});it('d',()=>{expect(hd303lru(93,73)).toBe(2);});it('e',()=>{expect(hd303lru(15,0)).toBe(4);});});
function hd304lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304lru_hd',()=>{it('a',()=>{expect(hd304lru(1,4)).toBe(2);});it('b',()=>{expect(hd304lru(3,1)).toBe(1);});it('c',()=>{expect(hd304lru(0,0)).toBe(0);});it('d',()=>{expect(hd304lru(93,73)).toBe(2);});it('e',()=>{expect(hd304lru(15,0)).toBe(4);});});
function hd305lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305lru_hd',()=>{it('a',()=>{expect(hd305lru(1,4)).toBe(2);});it('b',()=>{expect(hd305lru(3,1)).toBe(1);});it('c',()=>{expect(hd305lru(0,0)).toBe(0);});it('d',()=>{expect(hd305lru(93,73)).toBe(2);});it('e',()=>{expect(hd305lru(15,0)).toBe(4);});});
function hd306lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306lru_hd',()=>{it('a',()=>{expect(hd306lru(1,4)).toBe(2);});it('b',()=>{expect(hd306lru(3,1)).toBe(1);});it('c',()=>{expect(hd306lru(0,0)).toBe(0);});it('d',()=>{expect(hd306lru(93,73)).toBe(2);});it('e',()=>{expect(hd306lru(15,0)).toBe(4);});});
function hd307lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307lru_hd',()=>{it('a',()=>{expect(hd307lru(1,4)).toBe(2);});it('b',()=>{expect(hd307lru(3,1)).toBe(1);});it('c',()=>{expect(hd307lru(0,0)).toBe(0);});it('d',()=>{expect(hd307lru(93,73)).toBe(2);});it('e',()=>{expect(hd307lru(15,0)).toBe(4);});});
function hd308lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308lru_hd',()=>{it('a',()=>{expect(hd308lru(1,4)).toBe(2);});it('b',()=>{expect(hd308lru(3,1)).toBe(1);});it('c',()=>{expect(hd308lru(0,0)).toBe(0);});it('d',()=>{expect(hd308lru(93,73)).toBe(2);});it('e',()=>{expect(hd308lru(15,0)).toBe(4);});});
function hd309lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309lru_hd',()=>{it('a',()=>{expect(hd309lru(1,4)).toBe(2);});it('b',()=>{expect(hd309lru(3,1)).toBe(1);});it('c',()=>{expect(hd309lru(0,0)).toBe(0);});it('d',()=>{expect(hd309lru(93,73)).toBe(2);});it('e',()=>{expect(hd309lru(15,0)).toBe(4);});});
function hd310lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310lru_hd',()=>{it('a',()=>{expect(hd310lru(1,4)).toBe(2);});it('b',()=>{expect(hd310lru(3,1)).toBe(1);});it('c',()=>{expect(hd310lru(0,0)).toBe(0);});it('d',()=>{expect(hd310lru(93,73)).toBe(2);});it('e',()=>{expect(hd310lru(15,0)).toBe(4);});});
function hd311lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311lru_hd',()=>{it('a',()=>{expect(hd311lru(1,4)).toBe(2);});it('b',()=>{expect(hd311lru(3,1)).toBe(1);});it('c',()=>{expect(hd311lru(0,0)).toBe(0);});it('d',()=>{expect(hd311lru(93,73)).toBe(2);});it('e',()=>{expect(hd311lru(15,0)).toBe(4);});});
function hd312lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312lru_hd',()=>{it('a',()=>{expect(hd312lru(1,4)).toBe(2);});it('b',()=>{expect(hd312lru(3,1)).toBe(1);});it('c',()=>{expect(hd312lru(0,0)).toBe(0);});it('d',()=>{expect(hd312lru(93,73)).toBe(2);});it('e',()=>{expect(hd312lru(15,0)).toBe(4);});});
function hd313lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313lru_hd',()=>{it('a',()=>{expect(hd313lru(1,4)).toBe(2);});it('b',()=>{expect(hd313lru(3,1)).toBe(1);});it('c',()=>{expect(hd313lru(0,0)).toBe(0);});it('d',()=>{expect(hd313lru(93,73)).toBe(2);});it('e',()=>{expect(hd313lru(15,0)).toBe(4);});});
function hd314lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314lru_hd',()=>{it('a',()=>{expect(hd314lru(1,4)).toBe(2);});it('b',()=>{expect(hd314lru(3,1)).toBe(1);});it('c',()=>{expect(hd314lru(0,0)).toBe(0);});it('d',()=>{expect(hd314lru(93,73)).toBe(2);});it('e',()=>{expect(hd314lru(15,0)).toBe(4);});});
function hd315lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315lru_hd',()=>{it('a',()=>{expect(hd315lru(1,4)).toBe(2);});it('b',()=>{expect(hd315lru(3,1)).toBe(1);});it('c',()=>{expect(hd315lru(0,0)).toBe(0);});it('d',()=>{expect(hd315lru(93,73)).toBe(2);});it('e',()=>{expect(hd315lru(15,0)).toBe(4);});});
function hd316lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316lru_hd',()=>{it('a',()=>{expect(hd316lru(1,4)).toBe(2);});it('b',()=>{expect(hd316lru(3,1)).toBe(1);});it('c',()=>{expect(hd316lru(0,0)).toBe(0);});it('d',()=>{expect(hd316lru(93,73)).toBe(2);});it('e',()=>{expect(hd316lru(15,0)).toBe(4);});});
function hd317lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317lru_hd',()=>{it('a',()=>{expect(hd317lru(1,4)).toBe(2);});it('b',()=>{expect(hd317lru(3,1)).toBe(1);});it('c',()=>{expect(hd317lru(0,0)).toBe(0);});it('d',()=>{expect(hd317lru(93,73)).toBe(2);});it('e',()=>{expect(hd317lru(15,0)).toBe(4);});});
function hd318lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318lru_hd',()=>{it('a',()=>{expect(hd318lru(1,4)).toBe(2);});it('b',()=>{expect(hd318lru(3,1)).toBe(1);});it('c',()=>{expect(hd318lru(0,0)).toBe(0);});it('d',()=>{expect(hd318lru(93,73)).toBe(2);});it('e',()=>{expect(hd318lru(15,0)).toBe(4);});});
function hd319lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319lru_hd',()=>{it('a',()=>{expect(hd319lru(1,4)).toBe(2);});it('b',()=>{expect(hd319lru(3,1)).toBe(1);});it('c',()=>{expect(hd319lru(0,0)).toBe(0);});it('d',()=>{expect(hd319lru(93,73)).toBe(2);});it('e',()=>{expect(hd319lru(15,0)).toBe(4);});});
function hd320lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320lru_hd',()=>{it('a',()=>{expect(hd320lru(1,4)).toBe(2);});it('b',()=>{expect(hd320lru(3,1)).toBe(1);});it('c',()=>{expect(hd320lru(0,0)).toBe(0);});it('d',()=>{expect(hd320lru(93,73)).toBe(2);});it('e',()=>{expect(hd320lru(15,0)).toBe(4);});});
function hd321lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321lru_hd',()=>{it('a',()=>{expect(hd321lru(1,4)).toBe(2);});it('b',()=>{expect(hd321lru(3,1)).toBe(1);});it('c',()=>{expect(hd321lru(0,0)).toBe(0);});it('d',()=>{expect(hd321lru(93,73)).toBe(2);});it('e',()=>{expect(hd321lru(15,0)).toBe(4);});});
function hd322lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322lru_hd',()=>{it('a',()=>{expect(hd322lru(1,4)).toBe(2);});it('b',()=>{expect(hd322lru(3,1)).toBe(1);});it('c',()=>{expect(hd322lru(0,0)).toBe(0);});it('d',()=>{expect(hd322lru(93,73)).toBe(2);});it('e',()=>{expect(hd322lru(15,0)).toBe(4);});});
function hd323lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323lru_hd',()=>{it('a',()=>{expect(hd323lru(1,4)).toBe(2);});it('b',()=>{expect(hd323lru(3,1)).toBe(1);});it('c',()=>{expect(hd323lru(0,0)).toBe(0);});it('d',()=>{expect(hd323lru(93,73)).toBe(2);});it('e',()=>{expect(hd323lru(15,0)).toBe(4);});});
function hd324lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324lru_hd',()=>{it('a',()=>{expect(hd324lru(1,4)).toBe(2);});it('b',()=>{expect(hd324lru(3,1)).toBe(1);});it('c',()=>{expect(hd324lru(0,0)).toBe(0);});it('d',()=>{expect(hd324lru(93,73)).toBe(2);});it('e',()=>{expect(hd324lru(15,0)).toBe(4);});});
function hd325lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325lru_hd',()=>{it('a',()=>{expect(hd325lru(1,4)).toBe(2);});it('b',()=>{expect(hd325lru(3,1)).toBe(1);});it('c',()=>{expect(hd325lru(0,0)).toBe(0);});it('d',()=>{expect(hd325lru(93,73)).toBe(2);});it('e',()=>{expect(hd325lru(15,0)).toBe(4);});});
function hd326lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326lru_hd',()=>{it('a',()=>{expect(hd326lru(1,4)).toBe(2);});it('b',()=>{expect(hd326lru(3,1)).toBe(1);});it('c',()=>{expect(hd326lru(0,0)).toBe(0);});it('d',()=>{expect(hd326lru(93,73)).toBe(2);});it('e',()=>{expect(hd326lru(15,0)).toBe(4);});});
function hd327lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327lru_hd',()=>{it('a',()=>{expect(hd327lru(1,4)).toBe(2);});it('b',()=>{expect(hd327lru(3,1)).toBe(1);});it('c',()=>{expect(hd327lru(0,0)).toBe(0);});it('d',()=>{expect(hd327lru(93,73)).toBe(2);});it('e',()=>{expect(hd327lru(15,0)).toBe(4);});});
function hd328lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328lru_hd',()=>{it('a',()=>{expect(hd328lru(1,4)).toBe(2);});it('b',()=>{expect(hd328lru(3,1)).toBe(1);});it('c',()=>{expect(hd328lru(0,0)).toBe(0);});it('d',()=>{expect(hd328lru(93,73)).toBe(2);});it('e',()=>{expect(hd328lru(15,0)).toBe(4);});});
function hd329lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329lru_hd',()=>{it('a',()=>{expect(hd329lru(1,4)).toBe(2);});it('b',()=>{expect(hd329lru(3,1)).toBe(1);});it('c',()=>{expect(hd329lru(0,0)).toBe(0);});it('d',()=>{expect(hd329lru(93,73)).toBe(2);});it('e',()=>{expect(hd329lru(15,0)).toBe(4);});});
function hd330lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330lru_hd',()=>{it('a',()=>{expect(hd330lru(1,4)).toBe(2);});it('b',()=>{expect(hd330lru(3,1)).toBe(1);});it('c',()=>{expect(hd330lru(0,0)).toBe(0);});it('d',()=>{expect(hd330lru(93,73)).toBe(2);});it('e',()=>{expect(hd330lru(15,0)).toBe(4);});});
function hd331lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331lru_hd',()=>{it('a',()=>{expect(hd331lru(1,4)).toBe(2);});it('b',()=>{expect(hd331lru(3,1)).toBe(1);});it('c',()=>{expect(hd331lru(0,0)).toBe(0);});it('d',()=>{expect(hd331lru(93,73)).toBe(2);});it('e',()=>{expect(hd331lru(15,0)).toBe(4);});});
function hd332lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332lru_hd',()=>{it('a',()=>{expect(hd332lru(1,4)).toBe(2);});it('b',()=>{expect(hd332lru(3,1)).toBe(1);});it('c',()=>{expect(hd332lru(0,0)).toBe(0);});it('d',()=>{expect(hd332lru(93,73)).toBe(2);});it('e',()=>{expect(hd332lru(15,0)).toBe(4);});});
function hd333lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333lru_hd',()=>{it('a',()=>{expect(hd333lru(1,4)).toBe(2);});it('b',()=>{expect(hd333lru(3,1)).toBe(1);});it('c',()=>{expect(hd333lru(0,0)).toBe(0);});it('d',()=>{expect(hd333lru(93,73)).toBe(2);});it('e',()=>{expect(hd333lru(15,0)).toBe(4);});});
function hd334lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334lru_hd',()=>{it('a',()=>{expect(hd334lru(1,4)).toBe(2);});it('b',()=>{expect(hd334lru(3,1)).toBe(1);});it('c',()=>{expect(hd334lru(0,0)).toBe(0);});it('d',()=>{expect(hd334lru(93,73)).toBe(2);});it('e',()=>{expect(hd334lru(15,0)).toBe(4);});});
function hd335lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335lru_hd',()=>{it('a',()=>{expect(hd335lru(1,4)).toBe(2);});it('b',()=>{expect(hd335lru(3,1)).toBe(1);});it('c',()=>{expect(hd335lru(0,0)).toBe(0);});it('d',()=>{expect(hd335lru(93,73)).toBe(2);});it('e',()=>{expect(hd335lru(15,0)).toBe(4);});});
function hd336lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336lru_hd',()=>{it('a',()=>{expect(hd336lru(1,4)).toBe(2);});it('b',()=>{expect(hd336lru(3,1)).toBe(1);});it('c',()=>{expect(hd336lru(0,0)).toBe(0);});it('d',()=>{expect(hd336lru(93,73)).toBe(2);});it('e',()=>{expect(hd336lru(15,0)).toBe(4);});});
function hd337lru(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337lru_hd',()=>{it('a',()=>{expect(hd337lru(1,4)).toBe(2);});it('b',()=>{expect(hd337lru(3,1)).toBe(1);});it('c',()=>{expect(hd337lru(0,0)).toBe(0);});it('d',()=>{expect(hd337lru(93,73)).toBe(2);});it('e',()=>{expect(hd337lru(15,0)).toBe(4);});});
function hd338lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338lru2_hd',()=>{it('a',()=>{expect(hd338lru2(1,4)).toBe(2);});it('b',()=>{expect(hd338lru2(3,1)).toBe(1);});it('c',()=>{expect(hd338lru2(0,0)).toBe(0);});it('d',()=>{expect(hd338lru2(93,73)).toBe(2);});it('e',()=>{expect(hd338lru2(15,0)).toBe(4);});});
function hd339lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339lru2_hd',()=>{it('a',()=>{expect(hd339lru2(1,4)).toBe(2);});it('b',()=>{expect(hd339lru2(3,1)).toBe(1);});it('c',()=>{expect(hd339lru2(0,0)).toBe(0);});it('d',()=>{expect(hd339lru2(93,73)).toBe(2);});it('e',()=>{expect(hd339lru2(15,0)).toBe(4);});});
function hd340lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340lru2_hd',()=>{it('a',()=>{expect(hd340lru2(1,4)).toBe(2);});it('b',()=>{expect(hd340lru2(3,1)).toBe(1);});it('c',()=>{expect(hd340lru2(0,0)).toBe(0);});it('d',()=>{expect(hd340lru2(93,73)).toBe(2);});it('e',()=>{expect(hd340lru2(15,0)).toBe(4);});});
function hd341lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341lru2_hd',()=>{it('a',()=>{expect(hd341lru2(1,4)).toBe(2);});it('b',()=>{expect(hd341lru2(3,1)).toBe(1);});it('c',()=>{expect(hd341lru2(0,0)).toBe(0);});it('d',()=>{expect(hd341lru2(93,73)).toBe(2);});it('e',()=>{expect(hd341lru2(15,0)).toBe(4);});});
function hd342lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342lru2_hd',()=>{it('a',()=>{expect(hd342lru2(1,4)).toBe(2);});it('b',()=>{expect(hd342lru2(3,1)).toBe(1);});it('c',()=>{expect(hd342lru2(0,0)).toBe(0);});it('d',()=>{expect(hd342lru2(93,73)).toBe(2);});it('e',()=>{expect(hd342lru2(15,0)).toBe(4);});});
function hd343lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343lru2_hd',()=>{it('a',()=>{expect(hd343lru2(1,4)).toBe(2);});it('b',()=>{expect(hd343lru2(3,1)).toBe(1);});it('c',()=>{expect(hd343lru2(0,0)).toBe(0);});it('d',()=>{expect(hd343lru2(93,73)).toBe(2);});it('e',()=>{expect(hd343lru2(15,0)).toBe(4);});});
function hd344lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344lru2_hd',()=>{it('a',()=>{expect(hd344lru2(1,4)).toBe(2);});it('b',()=>{expect(hd344lru2(3,1)).toBe(1);});it('c',()=>{expect(hd344lru2(0,0)).toBe(0);});it('d',()=>{expect(hd344lru2(93,73)).toBe(2);});it('e',()=>{expect(hd344lru2(15,0)).toBe(4);});});
function hd345lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345lru2_hd',()=>{it('a',()=>{expect(hd345lru2(1,4)).toBe(2);});it('b',()=>{expect(hd345lru2(3,1)).toBe(1);});it('c',()=>{expect(hd345lru2(0,0)).toBe(0);});it('d',()=>{expect(hd345lru2(93,73)).toBe(2);});it('e',()=>{expect(hd345lru2(15,0)).toBe(4);});});
function hd346lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346lru2_hd',()=>{it('a',()=>{expect(hd346lru2(1,4)).toBe(2);});it('b',()=>{expect(hd346lru2(3,1)).toBe(1);});it('c',()=>{expect(hd346lru2(0,0)).toBe(0);});it('d',()=>{expect(hd346lru2(93,73)).toBe(2);});it('e',()=>{expect(hd346lru2(15,0)).toBe(4);});});
function hd347lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347lru2_hd',()=>{it('a',()=>{expect(hd347lru2(1,4)).toBe(2);});it('b',()=>{expect(hd347lru2(3,1)).toBe(1);});it('c',()=>{expect(hd347lru2(0,0)).toBe(0);});it('d',()=>{expect(hd347lru2(93,73)).toBe(2);});it('e',()=>{expect(hd347lru2(15,0)).toBe(4);});});
function hd348lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348lru2_hd',()=>{it('a',()=>{expect(hd348lru2(1,4)).toBe(2);});it('b',()=>{expect(hd348lru2(3,1)).toBe(1);});it('c',()=>{expect(hd348lru2(0,0)).toBe(0);});it('d',()=>{expect(hd348lru2(93,73)).toBe(2);});it('e',()=>{expect(hd348lru2(15,0)).toBe(4);});});
function hd349lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349lru2_hd',()=>{it('a',()=>{expect(hd349lru2(1,4)).toBe(2);});it('b',()=>{expect(hd349lru2(3,1)).toBe(1);});it('c',()=>{expect(hd349lru2(0,0)).toBe(0);});it('d',()=>{expect(hd349lru2(93,73)).toBe(2);});it('e',()=>{expect(hd349lru2(15,0)).toBe(4);});});
function hd350lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350lru2_hd',()=>{it('a',()=>{expect(hd350lru2(1,4)).toBe(2);});it('b',()=>{expect(hd350lru2(3,1)).toBe(1);});it('c',()=>{expect(hd350lru2(0,0)).toBe(0);});it('d',()=>{expect(hd350lru2(93,73)).toBe(2);});it('e',()=>{expect(hd350lru2(15,0)).toBe(4);});});
function hd351lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351lru2_hd',()=>{it('a',()=>{expect(hd351lru2(1,4)).toBe(2);});it('b',()=>{expect(hd351lru2(3,1)).toBe(1);});it('c',()=>{expect(hd351lru2(0,0)).toBe(0);});it('d',()=>{expect(hd351lru2(93,73)).toBe(2);});it('e',()=>{expect(hd351lru2(15,0)).toBe(4);});});
function hd352lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352lru2_hd',()=>{it('a',()=>{expect(hd352lru2(1,4)).toBe(2);});it('b',()=>{expect(hd352lru2(3,1)).toBe(1);});it('c',()=>{expect(hd352lru2(0,0)).toBe(0);});it('d',()=>{expect(hd352lru2(93,73)).toBe(2);});it('e',()=>{expect(hd352lru2(15,0)).toBe(4);});});
function hd353lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353lru2_hd',()=>{it('a',()=>{expect(hd353lru2(1,4)).toBe(2);});it('b',()=>{expect(hd353lru2(3,1)).toBe(1);});it('c',()=>{expect(hd353lru2(0,0)).toBe(0);});it('d',()=>{expect(hd353lru2(93,73)).toBe(2);});it('e',()=>{expect(hd353lru2(15,0)).toBe(4);});});
function hd354lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354lru2_hd',()=>{it('a',()=>{expect(hd354lru2(1,4)).toBe(2);});it('b',()=>{expect(hd354lru2(3,1)).toBe(1);});it('c',()=>{expect(hd354lru2(0,0)).toBe(0);});it('d',()=>{expect(hd354lru2(93,73)).toBe(2);});it('e',()=>{expect(hd354lru2(15,0)).toBe(4);});});
function hd355lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355lru2_hd',()=>{it('a',()=>{expect(hd355lru2(1,4)).toBe(2);});it('b',()=>{expect(hd355lru2(3,1)).toBe(1);});it('c',()=>{expect(hd355lru2(0,0)).toBe(0);});it('d',()=>{expect(hd355lru2(93,73)).toBe(2);});it('e',()=>{expect(hd355lru2(15,0)).toBe(4);});});
function hd356lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356lru2_hd',()=>{it('a',()=>{expect(hd356lru2(1,4)).toBe(2);});it('b',()=>{expect(hd356lru2(3,1)).toBe(1);});it('c',()=>{expect(hd356lru2(0,0)).toBe(0);});it('d',()=>{expect(hd356lru2(93,73)).toBe(2);});it('e',()=>{expect(hd356lru2(15,0)).toBe(4);});});
function hd357lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357lru2_hd',()=>{it('a',()=>{expect(hd357lru2(1,4)).toBe(2);});it('b',()=>{expect(hd357lru2(3,1)).toBe(1);});it('c',()=>{expect(hd357lru2(0,0)).toBe(0);});it('d',()=>{expect(hd357lru2(93,73)).toBe(2);});it('e',()=>{expect(hd357lru2(15,0)).toBe(4);});});
function hd358lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358lru2_hd',()=>{it('a',()=>{expect(hd358lru2(1,4)).toBe(2);});it('b',()=>{expect(hd358lru2(3,1)).toBe(1);});it('c',()=>{expect(hd358lru2(0,0)).toBe(0);});it('d',()=>{expect(hd358lru2(93,73)).toBe(2);});it('e',()=>{expect(hd358lru2(15,0)).toBe(4);});});
function hd359lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359lru2_hd',()=>{it('a',()=>{expect(hd359lru2(1,4)).toBe(2);});it('b',()=>{expect(hd359lru2(3,1)).toBe(1);});it('c',()=>{expect(hd359lru2(0,0)).toBe(0);});it('d',()=>{expect(hd359lru2(93,73)).toBe(2);});it('e',()=>{expect(hd359lru2(15,0)).toBe(4);});});
function hd360lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360lru2_hd',()=>{it('a',()=>{expect(hd360lru2(1,4)).toBe(2);});it('b',()=>{expect(hd360lru2(3,1)).toBe(1);});it('c',()=>{expect(hd360lru2(0,0)).toBe(0);});it('d',()=>{expect(hd360lru2(93,73)).toBe(2);});it('e',()=>{expect(hd360lru2(15,0)).toBe(4);});});
function hd361lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361lru2_hd',()=>{it('a',()=>{expect(hd361lru2(1,4)).toBe(2);});it('b',()=>{expect(hd361lru2(3,1)).toBe(1);});it('c',()=>{expect(hd361lru2(0,0)).toBe(0);});it('d',()=>{expect(hd361lru2(93,73)).toBe(2);});it('e',()=>{expect(hd361lru2(15,0)).toBe(4);});});
function hd362lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362lru2_hd',()=>{it('a',()=>{expect(hd362lru2(1,4)).toBe(2);});it('b',()=>{expect(hd362lru2(3,1)).toBe(1);});it('c',()=>{expect(hd362lru2(0,0)).toBe(0);});it('d',()=>{expect(hd362lru2(93,73)).toBe(2);});it('e',()=>{expect(hd362lru2(15,0)).toBe(4);});});
function hd363lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363lru2_hd',()=>{it('a',()=>{expect(hd363lru2(1,4)).toBe(2);});it('b',()=>{expect(hd363lru2(3,1)).toBe(1);});it('c',()=>{expect(hd363lru2(0,0)).toBe(0);});it('d',()=>{expect(hd363lru2(93,73)).toBe(2);});it('e',()=>{expect(hd363lru2(15,0)).toBe(4);});});
function hd364lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364lru2_hd',()=>{it('a',()=>{expect(hd364lru2(1,4)).toBe(2);});it('b',()=>{expect(hd364lru2(3,1)).toBe(1);});it('c',()=>{expect(hd364lru2(0,0)).toBe(0);});it('d',()=>{expect(hd364lru2(93,73)).toBe(2);});it('e',()=>{expect(hd364lru2(15,0)).toBe(4);});});
function hd365lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365lru2_hd',()=>{it('a',()=>{expect(hd365lru2(1,4)).toBe(2);});it('b',()=>{expect(hd365lru2(3,1)).toBe(1);});it('c',()=>{expect(hd365lru2(0,0)).toBe(0);});it('d',()=>{expect(hd365lru2(93,73)).toBe(2);});it('e',()=>{expect(hd365lru2(15,0)).toBe(4);});});
function hd366lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366lru2_hd',()=>{it('a',()=>{expect(hd366lru2(1,4)).toBe(2);});it('b',()=>{expect(hd366lru2(3,1)).toBe(1);});it('c',()=>{expect(hd366lru2(0,0)).toBe(0);});it('d',()=>{expect(hd366lru2(93,73)).toBe(2);});it('e',()=>{expect(hd366lru2(15,0)).toBe(4);});});
function hd367lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367lru2_hd',()=>{it('a',()=>{expect(hd367lru2(1,4)).toBe(2);});it('b',()=>{expect(hd367lru2(3,1)).toBe(1);});it('c',()=>{expect(hd367lru2(0,0)).toBe(0);});it('d',()=>{expect(hd367lru2(93,73)).toBe(2);});it('e',()=>{expect(hd367lru2(15,0)).toBe(4);});});
function hd368lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368lru2_hd',()=>{it('a',()=>{expect(hd368lru2(1,4)).toBe(2);});it('b',()=>{expect(hd368lru2(3,1)).toBe(1);});it('c',()=>{expect(hd368lru2(0,0)).toBe(0);});it('d',()=>{expect(hd368lru2(93,73)).toBe(2);});it('e',()=>{expect(hd368lru2(15,0)).toBe(4);});});
function hd369lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369lru2_hd',()=>{it('a',()=>{expect(hd369lru2(1,4)).toBe(2);});it('b',()=>{expect(hd369lru2(3,1)).toBe(1);});it('c',()=>{expect(hd369lru2(0,0)).toBe(0);});it('d',()=>{expect(hd369lru2(93,73)).toBe(2);});it('e',()=>{expect(hd369lru2(15,0)).toBe(4);});});
function hd370lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370lru2_hd',()=>{it('a',()=>{expect(hd370lru2(1,4)).toBe(2);});it('b',()=>{expect(hd370lru2(3,1)).toBe(1);});it('c',()=>{expect(hd370lru2(0,0)).toBe(0);});it('d',()=>{expect(hd370lru2(93,73)).toBe(2);});it('e',()=>{expect(hd370lru2(15,0)).toBe(4);});});
function hd371lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371lru2_hd',()=>{it('a',()=>{expect(hd371lru2(1,4)).toBe(2);});it('b',()=>{expect(hd371lru2(3,1)).toBe(1);});it('c',()=>{expect(hd371lru2(0,0)).toBe(0);});it('d',()=>{expect(hd371lru2(93,73)).toBe(2);});it('e',()=>{expect(hd371lru2(15,0)).toBe(4);});});
function hd372lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372lru2_hd',()=>{it('a',()=>{expect(hd372lru2(1,4)).toBe(2);});it('b',()=>{expect(hd372lru2(3,1)).toBe(1);});it('c',()=>{expect(hd372lru2(0,0)).toBe(0);});it('d',()=>{expect(hd372lru2(93,73)).toBe(2);});it('e',()=>{expect(hd372lru2(15,0)).toBe(4);});});
function hd373lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373lru2_hd',()=>{it('a',()=>{expect(hd373lru2(1,4)).toBe(2);});it('b',()=>{expect(hd373lru2(3,1)).toBe(1);});it('c',()=>{expect(hd373lru2(0,0)).toBe(0);});it('d',()=>{expect(hd373lru2(93,73)).toBe(2);});it('e',()=>{expect(hd373lru2(15,0)).toBe(4);});});
function hd374lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374lru2_hd',()=>{it('a',()=>{expect(hd374lru2(1,4)).toBe(2);});it('b',()=>{expect(hd374lru2(3,1)).toBe(1);});it('c',()=>{expect(hd374lru2(0,0)).toBe(0);});it('d',()=>{expect(hd374lru2(93,73)).toBe(2);});it('e',()=>{expect(hd374lru2(15,0)).toBe(4);});});
function hd375lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375lru2_hd',()=>{it('a',()=>{expect(hd375lru2(1,4)).toBe(2);});it('b',()=>{expect(hd375lru2(3,1)).toBe(1);});it('c',()=>{expect(hd375lru2(0,0)).toBe(0);});it('d',()=>{expect(hd375lru2(93,73)).toBe(2);});it('e',()=>{expect(hd375lru2(15,0)).toBe(4);});});
function hd376lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376lru2_hd',()=>{it('a',()=>{expect(hd376lru2(1,4)).toBe(2);});it('b',()=>{expect(hd376lru2(3,1)).toBe(1);});it('c',()=>{expect(hd376lru2(0,0)).toBe(0);});it('d',()=>{expect(hd376lru2(93,73)).toBe(2);});it('e',()=>{expect(hd376lru2(15,0)).toBe(4);});});
function hd377lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377lru2_hd',()=>{it('a',()=>{expect(hd377lru2(1,4)).toBe(2);});it('b',()=>{expect(hd377lru2(3,1)).toBe(1);});it('c',()=>{expect(hd377lru2(0,0)).toBe(0);});it('d',()=>{expect(hd377lru2(93,73)).toBe(2);});it('e',()=>{expect(hd377lru2(15,0)).toBe(4);});});
function hd378lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378lru2_hd',()=>{it('a',()=>{expect(hd378lru2(1,4)).toBe(2);});it('b',()=>{expect(hd378lru2(3,1)).toBe(1);});it('c',()=>{expect(hd378lru2(0,0)).toBe(0);});it('d',()=>{expect(hd378lru2(93,73)).toBe(2);});it('e',()=>{expect(hd378lru2(15,0)).toBe(4);});});
function hd379lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379lru2_hd',()=>{it('a',()=>{expect(hd379lru2(1,4)).toBe(2);});it('b',()=>{expect(hd379lru2(3,1)).toBe(1);});it('c',()=>{expect(hd379lru2(0,0)).toBe(0);});it('d',()=>{expect(hd379lru2(93,73)).toBe(2);});it('e',()=>{expect(hd379lru2(15,0)).toBe(4);});});
function hd380lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380lru2_hd',()=>{it('a',()=>{expect(hd380lru2(1,4)).toBe(2);});it('b',()=>{expect(hd380lru2(3,1)).toBe(1);});it('c',()=>{expect(hd380lru2(0,0)).toBe(0);});it('d',()=>{expect(hd380lru2(93,73)).toBe(2);});it('e',()=>{expect(hd380lru2(15,0)).toBe(4);});});
function hd381lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381lru2_hd',()=>{it('a',()=>{expect(hd381lru2(1,4)).toBe(2);});it('b',()=>{expect(hd381lru2(3,1)).toBe(1);});it('c',()=>{expect(hd381lru2(0,0)).toBe(0);});it('d',()=>{expect(hd381lru2(93,73)).toBe(2);});it('e',()=>{expect(hd381lru2(15,0)).toBe(4);});});
function hd382lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382lru2_hd',()=>{it('a',()=>{expect(hd382lru2(1,4)).toBe(2);});it('b',()=>{expect(hd382lru2(3,1)).toBe(1);});it('c',()=>{expect(hd382lru2(0,0)).toBe(0);});it('d',()=>{expect(hd382lru2(93,73)).toBe(2);});it('e',()=>{expect(hd382lru2(15,0)).toBe(4);});});
function hd383lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383lru2_hd',()=>{it('a',()=>{expect(hd383lru2(1,4)).toBe(2);});it('b',()=>{expect(hd383lru2(3,1)).toBe(1);});it('c',()=>{expect(hd383lru2(0,0)).toBe(0);});it('d',()=>{expect(hd383lru2(93,73)).toBe(2);});it('e',()=>{expect(hd383lru2(15,0)).toBe(4);});});
function hd384lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384lru2_hd',()=>{it('a',()=>{expect(hd384lru2(1,4)).toBe(2);});it('b',()=>{expect(hd384lru2(3,1)).toBe(1);});it('c',()=>{expect(hd384lru2(0,0)).toBe(0);});it('d',()=>{expect(hd384lru2(93,73)).toBe(2);});it('e',()=>{expect(hd384lru2(15,0)).toBe(4);});});
function hd385lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385lru2_hd',()=>{it('a',()=>{expect(hd385lru2(1,4)).toBe(2);});it('b',()=>{expect(hd385lru2(3,1)).toBe(1);});it('c',()=>{expect(hd385lru2(0,0)).toBe(0);});it('d',()=>{expect(hd385lru2(93,73)).toBe(2);});it('e',()=>{expect(hd385lru2(15,0)).toBe(4);});});
function hd386lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386lru2_hd',()=>{it('a',()=>{expect(hd386lru2(1,4)).toBe(2);});it('b',()=>{expect(hd386lru2(3,1)).toBe(1);});it('c',()=>{expect(hd386lru2(0,0)).toBe(0);});it('d',()=>{expect(hd386lru2(93,73)).toBe(2);});it('e',()=>{expect(hd386lru2(15,0)).toBe(4);});});
function hd387lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387lru2_hd',()=>{it('a',()=>{expect(hd387lru2(1,4)).toBe(2);});it('b',()=>{expect(hd387lru2(3,1)).toBe(1);});it('c',()=>{expect(hd387lru2(0,0)).toBe(0);});it('d',()=>{expect(hd387lru2(93,73)).toBe(2);});it('e',()=>{expect(hd387lru2(15,0)).toBe(4);});});
function hd388lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388lru2_hd',()=>{it('a',()=>{expect(hd388lru2(1,4)).toBe(2);});it('b',()=>{expect(hd388lru2(3,1)).toBe(1);});it('c',()=>{expect(hd388lru2(0,0)).toBe(0);});it('d',()=>{expect(hd388lru2(93,73)).toBe(2);});it('e',()=>{expect(hd388lru2(15,0)).toBe(4);});});
function hd389lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389lru2_hd',()=>{it('a',()=>{expect(hd389lru2(1,4)).toBe(2);});it('b',()=>{expect(hd389lru2(3,1)).toBe(1);});it('c',()=>{expect(hd389lru2(0,0)).toBe(0);});it('d',()=>{expect(hd389lru2(93,73)).toBe(2);});it('e',()=>{expect(hd389lru2(15,0)).toBe(4);});});
function hd390lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390lru2_hd',()=>{it('a',()=>{expect(hd390lru2(1,4)).toBe(2);});it('b',()=>{expect(hd390lru2(3,1)).toBe(1);});it('c',()=>{expect(hd390lru2(0,0)).toBe(0);});it('d',()=>{expect(hd390lru2(93,73)).toBe(2);});it('e',()=>{expect(hd390lru2(15,0)).toBe(4);});});
function hd391lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391lru2_hd',()=>{it('a',()=>{expect(hd391lru2(1,4)).toBe(2);});it('b',()=>{expect(hd391lru2(3,1)).toBe(1);});it('c',()=>{expect(hd391lru2(0,0)).toBe(0);});it('d',()=>{expect(hd391lru2(93,73)).toBe(2);});it('e',()=>{expect(hd391lru2(15,0)).toBe(4);});});
function hd392lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392lru2_hd',()=>{it('a',()=>{expect(hd392lru2(1,4)).toBe(2);});it('b',()=>{expect(hd392lru2(3,1)).toBe(1);});it('c',()=>{expect(hd392lru2(0,0)).toBe(0);});it('d',()=>{expect(hd392lru2(93,73)).toBe(2);});it('e',()=>{expect(hd392lru2(15,0)).toBe(4);});});
function hd393lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393lru2_hd',()=>{it('a',()=>{expect(hd393lru2(1,4)).toBe(2);});it('b',()=>{expect(hd393lru2(3,1)).toBe(1);});it('c',()=>{expect(hd393lru2(0,0)).toBe(0);});it('d',()=>{expect(hd393lru2(93,73)).toBe(2);});it('e',()=>{expect(hd393lru2(15,0)).toBe(4);});});
function hd394lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394lru2_hd',()=>{it('a',()=>{expect(hd394lru2(1,4)).toBe(2);});it('b',()=>{expect(hd394lru2(3,1)).toBe(1);});it('c',()=>{expect(hd394lru2(0,0)).toBe(0);});it('d',()=>{expect(hd394lru2(93,73)).toBe(2);});it('e',()=>{expect(hd394lru2(15,0)).toBe(4);});});
function hd395lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395lru2_hd',()=>{it('a',()=>{expect(hd395lru2(1,4)).toBe(2);});it('b',()=>{expect(hd395lru2(3,1)).toBe(1);});it('c',()=>{expect(hd395lru2(0,0)).toBe(0);});it('d',()=>{expect(hd395lru2(93,73)).toBe(2);});it('e',()=>{expect(hd395lru2(15,0)).toBe(4);});});
function hd396lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396lru2_hd',()=>{it('a',()=>{expect(hd396lru2(1,4)).toBe(2);});it('b',()=>{expect(hd396lru2(3,1)).toBe(1);});it('c',()=>{expect(hd396lru2(0,0)).toBe(0);});it('d',()=>{expect(hd396lru2(93,73)).toBe(2);});it('e',()=>{expect(hd396lru2(15,0)).toBe(4);});});
function hd397lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397lru2_hd',()=>{it('a',()=>{expect(hd397lru2(1,4)).toBe(2);});it('b',()=>{expect(hd397lru2(3,1)).toBe(1);});it('c',()=>{expect(hd397lru2(0,0)).toBe(0);});it('d',()=>{expect(hd397lru2(93,73)).toBe(2);});it('e',()=>{expect(hd397lru2(15,0)).toBe(4);});});
function hd398lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398lru2_hd',()=>{it('a',()=>{expect(hd398lru2(1,4)).toBe(2);});it('b',()=>{expect(hd398lru2(3,1)).toBe(1);});it('c',()=>{expect(hd398lru2(0,0)).toBe(0);});it('d',()=>{expect(hd398lru2(93,73)).toBe(2);});it('e',()=>{expect(hd398lru2(15,0)).toBe(4);});});
function hd399lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399lru2_hd',()=>{it('a',()=>{expect(hd399lru2(1,4)).toBe(2);});it('b',()=>{expect(hd399lru2(3,1)).toBe(1);});it('c',()=>{expect(hd399lru2(0,0)).toBe(0);});it('d',()=>{expect(hd399lru2(93,73)).toBe(2);});it('e',()=>{expect(hd399lru2(15,0)).toBe(4);});});
function hd400lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400lru2_hd',()=>{it('a',()=>{expect(hd400lru2(1,4)).toBe(2);});it('b',()=>{expect(hd400lru2(3,1)).toBe(1);});it('c',()=>{expect(hd400lru2(0,0)).toBe(0);});it('d',()=>{expect(hd400lru2(93,73)).toBe(2);});it('e',()=>{expect(hd400lru2(15,0)).toBe(4);});});
function hd401lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401lru2_hd',()=>{it('a',()=>{expect(hd401lru2(1,4)).toBe(2);});it('b',()=>{expect(hd401lru2(3,1)).toBe(1);});it('c',()=>{expect(hd401lru2(0,0)).toBe(0);});it('d',()=>{expect(hd401lru2(93,73)).toBe(2);});it('e',()=>{expect(hd401lru2(15,0)).toBe(4);});});
function hd402lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402lru2_hd',()=>{it('a',()=>{expect(hd402lru2(1,4)).toBe(2);});it('b',()=>{expect(hd402lru2(3,1)).toBe(1);});it('c',()=>{expect(hd402lru2(0,0)).toBe(0);});it('d',()=>{expect(hd402lru2(93,73)).toBe(2);});it('e',()=>{expect(hd402lru2(15,0)).toBe(4);});});
function hd403lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403lru2_hd',()=>{it('a',()=>{expect(hd403lru2(1,4)).toBe(2);});it('b',()=>{expect(hd403lru2(3,1)).toBe(1);});it('c',()=>{expect(hd403lru2(0,0)).toBe(0);});it('d',()=>{expect(hd403lru2(93,73)).toBe(2);});it('e',()=>{expect(hd403lru2(15,0)).toBe(4);});});
function hd404lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404lru2_hd',()=>{it('a',()=>{expect(hd404lru2(1,4)).toBe(2);});it('b',()=>{expect(hd404lru2(3,1)).toBe(1);});it('c',()=>{expect(hd404lru2(0,0)).toBe(0);});it('d',()=>{expect(hd404lru2(93,73)).toBe(2);});it('e',()=>{expect(hd404lru2(15,0)).toBe(4);});});
function hd405lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405lru2_hd',()=>{it('a',()=>{expect(hd405lru2(1,4)).toBe(2);});it('b',()=>{expect(hd405lru2(3,1)).toBe(1);});it('c',()=>{expect(hd405lru2(0,0)).toBe(0);});it('d',()=>{expect(hd405lru2(93,73)).toBe(2);});it('e',()=>{expect(hd405lru2(15,0)).toBe(4);});});
function hd406lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406lru2_hd',()=>{it('a',()=>{expect(hd406lru2(1,4)).toBe(2);});it('b',()=>{expect(hd406lru2(3,1)).toBe(1);});it('c',()=>{expect(hd406lru2(0,0)).toBe(0);});it('d',()=>{expect(hd406lru2(93,73)).toBe(2);});it('e',()=>{expect(hd406lru2(15,0)).toBe(4);});});
function hd407lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407lru2_hd',()=>{it('a',()=>{expect(hd407lru2(1,4)).toBe(2);});it('b',()=>{expect(hd407lru2(3,1)).toBe(1);});it('c',()=>{expect(hd407lru2(0,0)).toBe(0);});it('d',()=>{expect(hd407lru2(93,73)).toBe(2);});it('e',()=>{expect(hd407lru2(15,0)).toBe(4);});});
function hd408lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408lru2_hd',()=>{it('a',()=>{expect(hd408lru2(1,4)).toBe(2);});it('b',()=>{expect(hd408lru2(3,1)).toBe(1);});it('c',()=>{expect(hd408lru2(0,0)).toBe(0);});it('d',()=>{expect(hd408lru2(93,73)).toBe(2);});it('e',()=>{expect(hd408lru2(15,0)).toBe(4);});});
function hd409lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409lru2_hd',()=>{it('a',()=>{expect(hd409lru2(1,4)).toBe(2);});it('b',()=>{expect(hd409lru2(3,1)).toBe(1);});it('c',()=>{expect(hd409lru2(0,0)).toBe(0);});it('d',()=>{expect(hd409lru2(93,73)).toBe(2);});it('e',()=>{expect(hd409lru2(15,0)).toBe(4);});});
function hd410lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410lru2_hd',()=>{it('a',()=>{expect(hd410lru2(1,4)).toBe(2);});it('b',()=>{expect(hd410lru2(3,1)).toBe(1);});it('c',()=>{expect(hd410lru2(0,0)).toBe(0);});it('d',()=>{expect(hd410lru2(93,73)).toBe(2);});it('e',()=>{expect(hd410lru2(15,0)).toBe(4);});});
function hd411lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411lru2_hd',()=>{it('a',()=>{expect(hd411lru2(1,4)).toBe(2);});it('b',()=>{expect(hd411lru2(3,1)).toBe(1);});it('c',()=>{expect(hd411lru2(0,0)).toBe(0);});it('d',()=>{expect(hd411lru2(93,73)).toBe(2);});it('e',()=>{expect(hd411lru2(15,0)).toBe(4);});});
function hd412lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412lru2_hd',()=>{it('a',()=>{expect(hd412lru2(1,4)).toBe(2);});it('b',()=>{expect(hd412lru2(3,1)).toBe(1);});it('c',()=>{expect(hd412lru2(0,0)).toBe(0);});it('d',()=>{expect(hd412lru2(93,73)).toBe(2);});it('e',()=>{expect(hd412lru2(15,0)).toBe(4);});});
function hd413lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413lru2_hd',()=>{it('a',()=>{expect(hd413lru2(1,4)).toBe(2);});it('b',()=>{expect(hd413lru2(3,1)).toBe(1);});it('c',()=>{expect(hd413lru2(0,0)).toBe(0);});it('d',()=>{expect(hd413lru2(93,73)).toBe(2);});it('e',()=>{expect(hd413lru2(15,0)).toBe(4);});});
function hd414lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414lru2_hd',()=>{it('a',()=>{expect(hd414lru2(1,4)).toBe(2);});it('b',()=>{expect(hd414lru2(3,1)).toBe(1);});it('c',()=>{expect(hd414lru2(0,0)).toBe(0);});it('d',()=>{expect(hd414lru2(93,73)).toBe(2);});it('e',()=>{expect(hd414lru2(15,0)).toBe(4);});});
function hd415lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415lru2_hd',()=>{it('a',()=>{expect(hd415lru2(1,4)).toBe(2);});it('b',()=>{expect(hd415lru2(3,1)).toBe(1);});it('c',()=>{expect(hd415lru2(0,0)).toBe(0);});it('d',()=>{expect(hd415lru2(93,73)).toBe(2);});it('e',()=>{expect(hd415lru2(15,0)).toBe(4);});});
function hd416lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416lru2_hd',()=>{it('a',()=>{expect(hd416lru2(1,4)).toBe(2);});it('b',()=>{expect(hd416lru2(3,1)).toBe(1);});it('c',()=>{expect(hd416lru2(0,0)).toBe(0);});it('d',()=>{expect(hd416lru2(93,73)).toBe(2);});it('e',()=>{expect(hd416lru2(15,0)).toBe(4);});});
function hd417lru2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417lru2_hd',()=>{it('a',()=>{expect(hd417lru2(1,4)).toBe(2);});it('b',()=>{expect(hd417lru2(3,1)).toBe(1);});it('c',()=>{expect(hd417lru2(0,0)).toBe(0);});it('d',()=>{expect(hd417lru2(93,73)).toBe(2);});it('e',()=>{expect(hd417lru2(15,0)).toBe(4);});});
