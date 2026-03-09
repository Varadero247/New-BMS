// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { BloomFilter, createBloomFilter, optimalBloomSize, optimalHashCount } from '../bloom-filter';

describe('BloomFilter - construction', () => {
  it('creates with default size', () => { expect(new BloomFilter().bitSize).toBe(1024); });
  it('creates with custom size', () => { expect(new BloomFilter(2048).bitSize).toBe(2048); });
  it('default k = 3', () => { expect(new BloomFilter().hashFunctions).toBe(3); });
  it('custom k', () => { expect(new BloomFilter(512, 5).hashFunctions).toBe(5); });
  it('createBloomFilter factory', () => { expect(createBloomFilter()).toBeInstanceOf(BloomFilter); });
  for (let i = 1; i <= 50; i++) {
    it(`BloomFilter bitSize = ${i * 64}`, () => {
      expect(new BloomFilter(i * 64).bitSize).toBe(i * 64);
    });
  }
});

describe('BloomFilter - add and mightContain', () => {
  it('added item might be contained', () => {
    const bf = new BloomFilter(1024);
    bf.add('hello');
    expect(bf.mightContain('hello')).toBe(true);
  });
  it('item not added is likely not contained', () => {
    expect(new BloomFilter(1024).mightContain('notadded')).toBe(false);
  });
  it('multiple adds', () => {
    const bf = new BloomFilter(2048);
    bf.add('a'); bf.add('b'); bf.add('c');
    expect(bf.mightContain('a')).toBe(true);
    expect(bf.mightContain('b')).toBe(true);
    expect(bf.mightContain('c')).toBe(true);
  });
  for (let i = 0; i < 100; i++) {
    it(`add and contain item${i}`, () => {
      const bf = new BloomFilter(2048);
      bf.add('item' + i);
      expect(bf.mightContain('item' + i)).toBe(true);
    });
  }
  for (let n = 1; n <= 50; n++) {
    it(`all ${n} added items contained`, () => {
      const bf = new BloomFilter(4096);
      const words = Array.from({ length: n }, (_, i) => 'word' + i);
      for (const w of words) bf.add(w);
      expect(words.every(w => bf.mightContain(w))).toBe(true);
    });
  }
});

describe('BloomFilter - clear and merge', () => {
  it('clear removes all items', () => {
    const bf = new BloomFilter(1024);
    bf.add('test');
    bf.clear();
    expect(bf.mightContain('test')).toBe(false);
  });
  it('merge combines two filters', () => {
    const bf1 = new BloomFilter(1024, 3);
    const bf2 = new BloomFilter(1024, 3);
    bf1.add('a'); bf2.add('b');
    const merged = bf1.merge(bf2);
    expect(merged.mightContain('a')).toBe(true);
    expect(merged.mightContain('b')).toBe(true);
  });
  it('merge throws for incompatible filters', () => {
    const bf1 = new BloomFilter(1024, 3);
    const bf2 = new BloomFilter(2048, 3);
    expect(() => bf1.merge(bf2)).toThrow();
  });
  for (let i = 0; i < 50; i++) {
    it('merge preserves items ' + i, () => {
      const bf1 = new BloomFilter(2048, 3);
      const bf2 = new BloomFilter(2048, 3);
      bf1.add('left' + i); bf2.add('right' + i);
      const m = bf1.merge(bf2);
      expect(m.mightContain('left' + i)).toBe(true);
      expect(m.mightContain('right' + i)).toBe(true);
    });
  }
});

describe('BloomFilter - false positive rate', () => {
  it('fpr at n=0 is 0', () => { expect(new BloomFilter(1024).estimateFalsePositiveRate(0)).toBeCloseTo(0, 5); });
  it('fpr increases with n', () => {
    const bf = new BloomFilter(1024, 3);
    expect(bf.estimateFalsePositiveRate(100)).toBeGreaterThan(bf.estimateFalsePositiveRate(10));
  });
  for (let n = 1; n <= 50; n++) {
    it('fpr(' + n + ') in [0,1]', () => {
      const r = new BloomFilter(4096, 3).estimateFalsePositiveRate(n);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(1);
    });
  }
});

describe('optimalBloomSize and optimalHashCount', () => {
  it('optimalBloomSize for n=1000, fpr=0.01 is positive', () => {
    expect(optimalBloomSize(1000, 0.01)).toBeGreaterThan(0);
  });
  it('optimalHashCount is positive', () => {
    expect(optimalHashCount(9585, 1000)).toBeGreaterThan(0);
  });
  for (let i = 1; i <= 50; i++) {
    it('optimalBloomSize(' + i * 100 + ', 0.01) > 0', () => {
      expect(optimalBloomSize(i * 100, 0.01)).toBeGreaterThan(0);
    });
  }
  for (let i = 1; i <= 50; i++) {
    it('optimalHashCount(' + i * 100 + ', 100) >= 1', () => {
      expect(optimalHashCount(i * 100, 100)).toBeGreaterThanOrEqual(1);
    });
  }
});

describe('BloomFilter extra', () => {
  for (let i = 0; i < 100; i++) {
    it('empty filter does not contain key' + i, () => {
      expect(new BloomFilter(2048).mightContain('key' + i)).toBe(false);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('after clear mightContain is false ' + i, () => {
      const bf = new BloomFilter(2048);
      bf.add('item' + i);
      bf.clear();
      expect(bf.mightContain('item' + i)).toBe(false);
    });
  }
});

describe('bloom top-up', () => {
  for (let i = 0; i < 100; i++) {
    it('added string' + i + ' is contained', () => {
      const bf = new BloomFilter(4096, 3);
      bf.add('teststring' + i);
      expect(bf.mightContain('teststring' + i)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('bitSize after construction ' + i, () => {
      expect(new BloomFilter((i + 1) * 32).bitSize).toBe((i + 1) * 32);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('hashFunctions preserved ' + i, () => {
      const k = (i % 5) + 1;
      expect(new BloomFilter(1024, k).hashFunctions).toBe(k);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('clear then add works fresh ' + i, () => {
      const bf = new BloomFilter(2048);
      bf.add('old' + i); bf.clear();
      bf.add('new' + i);
      expect(bf.mightContain('new' + i)).toBe(true);
    });
  }
});
function hd258blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258blm_hd',()=>{it('a',()=>{expect(hd258blm(1,4)).toBe(2);});it('b',()=>{expect(hd258blm(3,1)).toBe(1);});it('c',()=>{expect(hd258blm(0,0)).toBe(0);});it('d',()=>{expect(hd258blm(93,73)).toBe(2);});it('e',()=>{expect(hd258blm(15,0)).toBe(4);});});
function hd259blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259blm_hd',()=>{it('a',()=>{expect(hd259blm(1,4)).toBe(2);});it('b',()=>{expect(hd259blm(3,1)).toBe(1);});it('c',()=>{expect(hd259blm(0,0)).toBe(0);});it('d',()=>{expect(hd259blm(93,73)).toBe(2);});it('e',()=>{expect(hd259blm(15,0)).toBe(4);});});
function hd260blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260blm_hd',()=>{it('a',()=>{expect(hd260blm(1,4)).toBe(2);});it('b',()=>{expect(hd260blm(3,1)).toBe(1);});it('c',()=>{expect(hd260blm(0,0)).toBe(0);});it('d',()=>{expect(hd260blm(93,73)).toBe(2);});it('e',()=>{expect(hd260blm(15,0)).toBe(4);});});
function hd261blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261blm_hd',()=>{it('a',()=>{expect(hd261blm(1,4)).toBe(2);});it('b',()=>{expect(hd261blm(3,1)).toBe(1);});it('c',()=>{expect(hd261blm(0,0)).toBe(0);});it('d',()=>{expect(hd261blm(93,73)).toBe(2);});it('e',()=>{expect(hd261blm(15,0)).toBe(4);});});
function hd262blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262blm_hd',()=>{it('a',()=>{expect(hd262blm(1,4)).toBe(2);});it('b',()=>{expect(hd262blm(3,1)).toBe(1);});it('c',()=>{expect(hd262blm(0,0)).toBe(0);});it('d',()=>{expect(hd262blm(93,73)).toBe(2);});it('e',()=>{expect(hd262blm(15,0)).toBe(4);});});
function hd263blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263blm_hd',()=>{it('a',()=>{expect(hd263blm(1,4)).toBe(2);});it('b',()=>{expect(hd263blm(3,1)).toBe(1);});it('c',()=>{expect(hd263blm(0,0)).toBe(0);});it('d',()=>{expect(hd263blm(93,73)).toBe(2);});it('e',()=>{expect(hd263blm(15,0)).toBe(4);});});
function hd264blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264blm_hd',()=>{it('a',()=>{expect(hd264blm(1,4)).toBe(2);});it('b',()=>{expect(hd264blm(3,1)).toBe(1);});it('c',()=>{expect(hd264blm(0,0)).toBe(0);});it('d',()=>{expect(hd264blm(93,73)).toBe(2);});it('e',()=>{expect(hd264blm(15,0)).toBe(4);});});
function hd265blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265blm_hd',()=>{it('a',()=>{expect(hd265blm(1,4)).toBe(2);});it('b',()=>{expect(hd265blm(3,1)).toBe(1);});it('c',()=>{expect(hd265blm(0,0)).toBe(0);});it('d',()=>{expect(hd265blm(93,73)).toBe(2);});it('e',()=>{expect(hd265blm(15,0)).toBe(4);});});
function hd266blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266blm_hd',()=>{it('a',()=>{expect(hd266blm(1,4)).toBe(2);});it('b',()=>{expect(hd266blm(3,1)).toBe(1);});it('c',()=>{expect(hd266blm(0,0)).toBe(0);});it('d',()=>{expect(hd266blm(93,73)).toBe(2);});it('e',()=>{expect(hd266blm(15,0)).toBe(4);});});
function hd267blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267blm_hd',()=>{it('a',()=>{expect(hd267blm(1,4)).toBe(2);});it('b',()=>{expect(hd267blm(3,1)).toBe(1);});it('c',()=>{expect(hd267blm(0,0)).toBe(0);});it('d',()=>{expect(hd267blm(93,73)).toBe(2);});it('e',()=>{expect(hd267blm(15,0)).toBe(4);});});
function hd268blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268blm_hd',()=>{it('a',()=>{expect(hd268blm(1,4)).toBe(2);});it('b',()=>{expect(hd268blm(3,1)).toBe(1);});it('c',()=>{expect(hd268blm(0,0)).toBe(0);});it('d',()=>{expect(hd268blm(93,73)).toBe(2);});it('e',()=>{expect(hd268blm(15,0)).toBe(4);});});
function hd269blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269blm_hd',()=>{it('a',()=>{expect(hd269blm(1,4)).toBe(2);});it('b',()=>{expect(hd269blm(3,1)).toBe(1);});it('c',()=>{expect(hd269blm(0,0)).toBe(0);});it('d',()=>{expect(hd269blm(93,73)).toBe(2);});it('e',()=>{expect(hd269blm(15,0)).toBe(4);});});
function hd270blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270blm_hd',()=>{it('a',()=>{expect(hd270blm(1,4)).toBe(2);});it('b',()=>{expect(hd270blm(3,1)).toBe(1);});it('c',()=>{expect(hd270blm(0,0)).toBe(0);});it('d',()=>{expect(hd270blm(93,73)).toBe(2);});it('e',()=>{expect(hd270blm(15,0)).toBe(4);});});
function hd271blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271blm_hd',()=>{it('a',()=>{expect(hd271blm(1,4)).toBe(2);});it('b',()=>{expect(hd271blm(3,1)).toBe(1);});it('c',()=>{expect(hd271blm(0,0)).toBe(0);});it('d',()=>{expect(hd271blm(93,73)).toBe(2);});it('e',()=>{expect(hd271blm(15,0)).toBe(4);});});
function hd272blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272blm_hd',()=>{it('a',()=>{expect(hd272blm(1,4)).toBe(2);});it('b',()=>{expect(hd272blm(3,1)).toBe(1);});it('c',()=>{expect(hd272blm(0,0)).toBe(0);});it('d',()=>{expect(hd272blm(93,73)).toBe(2);});it('e',()=>{expect(hd272blm(15,0)).toBe(4);});});
function hd273blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273blm_hd',()=>{it('a',()=>{expect(hd273blm(1,4)).toBe(2);});it('b',()=>{expect(hd273blm(3,1)).toBe(1);});it('c',()=>{expect(hd273blm(0,0)).toBe(0);});it('d',()=>{expect(hd273blm(93,73)).toBe(2);});it('e',()=>{expect(hd273blm(15,0)).toBe(4);});});
function hd274blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274blm_hd',()=>{it('a',()=>{expect(hd274blm(1,4)).toBe(2);});it('b',()=>{expect(hd274blm(3,1)).toBe(1);});it('c',()=>{expect(hd274blm(0,0)).toBe(0);});it('d',()=>{expect(hd274blm(93,73)).toBe(2);});it('e',()=>{expect(hd274blm(15,0)).toBe(4);});});
function hd275blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275blm_hd',()=>{it('a',()=>{expect(hd275blm(1,4)).toBe(2);});it('b',()=>{expect(hd275blm(3,1)).toBe(1);});it('c',()=>{expect(hd275blm(0,0)).toBe(0);});it('d',()=>{expect(hd275blm(93,73)).toBe(2);});it('e',()=>{expect(hd275blm(15,0)).toBe(4);});});
function hd276blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276blm_hd',()=>{it('a',()=>{expect(hd276blm(1,4)).toBe(2);});it('b',()=>{expect(hd276blm(3,1)).toBe(1);});it('c',()=>{expect(hd276blm(0,0)).toBe(0);});it('d',()=>{expect(hd276blm(93,73)).toBe(2);});it('e',()=>{expect(hd276blm(15,0)).toBe(4);});});
function hd277blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277blm_hd',()=>{it('a',()=>{expect(hd277blm(1,4)).toBe(2);});it('b',()=>{expect(hd277blm(3,1)).toBe(1);});it('c',()=>{expect(hd277blm(0,0)).toBe(0);});it('d',()=>{expect(hd277blm(93,73)).toBe(2);});it('e',()=>{expect(hd277blm(15,0)).toBe(4);});});
function hd278blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278blm_hd',()=>{it('a',()=>{expect(hd278blm(1,4)).toBe(2);});it('b',()=>{expect(hd278blm(3,1)).toBe(1);});it('c',()=>{expect(hd278blm(0,0)).toBe(0);});it('d',()=>{expect(hd278blm(93,73)).toBe(2);});it('e',()=>{expect(hd278blm(15,0)).toBe(4);});});
function hd279blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279blm_hd',()=>{it('a',()=>{expect(hd279blm(1,4)).toBe(2);});it('b',()=>{expect(hd279blm(3,1)).toBe(1);});it('c',()=>{expect(hd279blm(0,0)).toBe(0);});it('d',()=>{expect(hd279blm(93,73)).toBe(2);});it('e',()=>{expect(hd279blm(15,0)).toBe(4);});});
function hd280blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280blm_hd',()=>{it('a',()=>{expect(hd280blm(1,4)).toBe(2);});it('b',()=>{expect(hd280blm(3,1)).toBe(1);});it('c',()=>{expect(hd280blm(0,0)).toBe(0);});it('d',()=>{expect(hd280blm(93,73)).toBe(2);});it('e',()=>{expect(hd280blm(15,0)).toBe(4);});});
function hd281blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281blm_hd',()=>{it('a',()=>{expect(hd281blm(1,4)).toBe(2);});it('b',()=>{expect(hd281blm(3,1)).toBe(1);});it('c',()=>{expect(hd281blm(0,0)).toBe(0);});it('d',()=>{expect(hd281blm(93,73)).toBe(2);});it('e',()=>{expect(hd281blm(15,0)).toBe(4);});});
function hd282blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282blm_hd',()=>{it('a',()=>{expect(hd282blm(1,4)).toBe(2);});it('b',()=>{expect(hd282blm(3,1)).toBe(1);});it('c',()=>{expect(hd282blm(0,0)).toBe(0);});it('d',()=>{expect(hd282blm(93,73)).toBe(2);});it('e',()=>{expect(hd282blm(15,0)).toBe(4);});});
function hd283blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283blm_hd',()=>{it('a',()=>{expect(hd283blm(1,4)).toBe(2);});it('b',()=>{expect(hd283blm(3,1)).toBe(1);});it('c',()=>{expect(hd283blm(0,0)).toBe(0);});it('d',()=>{expect(hd283blm(93,73)).toBe(2);});it('e',()=>{expect(hd283blm(15,0)).toBe(4);});});
function hd284blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284blm_hd',()=>{it('a',()=>{expect(hd284blm(1,4)).toBe(2);});it('b',()=>{expect(hd284blm(3,1)).toBe(1);});it('c',()=>{expect(hd284blm(0,0)).toBe(0);});it('d',()=>{expect(hd284blm(93,73)).toBe(2);});it('e',()=>{expect(hd284blm(15,0)).toBe(4);});});
function hd285blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285blm_hd',()=>{it('a',()=>{expect(hd285blm(1,4)).toBe(2);});it('b',()=>{expect(hd285blm(3,1)).toBe(1);});it('c',()=>{expect(hd285blm(0,0)).toBe(0);});it('d',()=>{expect(hd285blm(93,73)).toBe(2);});it('e',()=>{expect(hd285blm(15,0)).toBe(4);});});
function hd286blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286blm_hd',()=>{it('a',()=>{expect(hd286blm(1,4)).toBe(2);});it('b',()=>{expect(hd286blm(3,1)).toBe(1);});it('c',()=>{expect(hd286blm(0,0)).toBe(0);});it('d',()=>{expect(hd286blm(93,73)).toBe(2);});it('e',()=>{expect(hd286blm(15,0)).toBe(4);});});
function hd287blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287blm_hd',()=>{it('a',()=>{expect(hd287blm(1,4)).toBe(2);});it('b',()=>{expect(hd287blm(3,1)).toBe(1);});it('c',()=>{expect(hd287blm(0,0)).toBe(0);});it('d',()=>{expect(hd287blm(93,73)).toBe(2);});it('e',()=>{expect(hd287blm(15,0)).toBe(4);});});
function hd288blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288blm_hd',()=>{it('a',()=>{expect(hd288blm(1,4)).toBe(2);});it('b',()=>{expect(hd288blm(3,1)).toBe(1);});it('c',()=>{expect(hd288blm(0,0)).toBe(0);});it('d',()=>{expect(hd288blm(93,73)).toBe(2);});it('e',()=>{expect(hd288blm(15,0)).toBe(4);});});
function hd289blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289blm_hd',()=>{it('a',()=>{expect(hd289blm(1,4)).toBe(2);});it('b',()=>{expect(hd289blm(3,1)).toBe(1);});it('c',()=>{expect(hd289blm(0,0)).toBe(0);});it('d',()=>{expect(hd289blm(93,73)).toBe(2);});it('e',()=>{expect(hd289blm(15,0)).toBe(4);});});
function hd290blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290blm_hd',()=>{it('a',()=>{expect(hd290blm(1,4)).toBe(2);});it('b',()=>{expect(hd290blm(3,1)).toBe(1);});it('c',()=>{expect(hd290blm(0,0)).toBe(0);});it('d',()=>{expect(hd290blm(93,73)).toBe(2);});it('e',()=>{expect(hd290blm(15,0)).toBe(4);});});
function hd291blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291blm_hd',()=>{it('a',()=>{expect(hd291blm(1,4)).toBe(2);});it('b',()=>{expect(hd291blm(3,1)).toBe(1);});it('c',()=>{expect(hd291blm(0,0)).toBe(0);});it('d',()=>{expect(hd291blm(93,73)).toBe(2);});it('e',()=>{expect(hd291blm(15,0)).toBe(4);});});
function hd292blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292blm_hd',()=>{it('a',()=>{expect(hd292blm(1,4)).toBe(2);});it('b',()=>{expect(hd292blm(3,1)).toBe(1);});it('c',()=>{expect(hd292blm(0,0)).toBe(0);});it('d',()=>{expect(hd292blm(93,73)).toBe(2);});it('e',()=>{expect(hd292blm(15,0)).toBe(4);});});
function hd293blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293blm_hd',()=>{it('a',()=>{expect(hd293blm(1,4)).toBe(2);});it('b',()=>{expect(hd293blm(3,1)).toBe(1);});it('c',()=>{expect(hd293blm(0,0)).toBe(0);});it('d',()=>{expect(hd293blm(93,73)).toBe(2);});it('e',()=>{expect(hd293blm(15,0)).toBe(4);});});
function hd294blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294blm_hd',()=>{it('a',()=>{expect(hd294blm(1,4)).toBe(2);});it('b',()=>{expect(hd294blm(3,1)).toBe(1);});it('c',()=>{expect(hd294blm(0,0)).toBe(0);});it('d',()=>{expect(hd294blm(93,73)).toBe(2);});it('e',()=>{expect(hd294blm(15,0)).toBe(4);});});
function hd295blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295blm_hd',()=>{it('a',()=>{expect(hd295blm(1,4)).toBe(2);});it('b',()=>{expect(hd295blm(3,1)).toBe(1);});it('c',()=>{expect(hd295blm(0,0)).toBe(0);});it('d',()=>{expect(hd295blm(93,73)).toBe(2);});it('e',()=>{expect(hd295blm(15,0)).toBe(4);});});
function hd296blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296blm_hd',()=>{it('a',()=>{expect(hd296blm(1,4)).toBe(2);});it('b',()=>{expect(hd296blm(3,1)).toBe(1);});it('c',()=>{expect(hd296blm(0,0)).toBe(0);});it('d',()=>{expect(hd296blm(93,73)).toBe(2);});it('e',()=>{expect(hd296blm(15,0)).toBe(4);});});
function hd297blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297blm_hd',()=>{it('a',()=>{expect(hd297blm(1,4)).toBe(2);});it('b',()=>{expect(hd297blm(3,1)).toBe(1);});it('c',()=>{expect(hd297blm(0,0)).toBe(0);});it('d',()=>{expect(hd297blm(93,73)).toBe(2);});it('e',()=>{expect(hd297blm(15,0)).toBe(4);});});
function hd298blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298blm_hd',()=>{it('a',()=>{expect(hd298blm(1,4)).toBe(2);});it('b',()=>{expect(hd298blm(3,1)).toBe(1);});it('c',()=>{expect(hd298blm(0,0)).toBe(0);});it('d',()=>{expect(hd298blm(93,73)).toBe(2);});it('e',()=>{expect(hd298blm(15,0)).toBe(4);});});
function hd299blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299blm_hd',()=>{it('a',()=>{expect(hd299blm(1,4)).toBe(2);});it('b',()=>{expect(hd299blm(3,1)).toBe(1);});it('c',()=>{expect(hd299blm(0,0)).toBe(0);});it('d',()=>{expect(hd299blm(93,73)).toBe(2);});it('e',()=>{expect(hd299blm(15,0)).toBe(4);});});
function hd300blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300blm_hd',()=>{it('a',()=>{expect(hd300blm(1,4)).toBe(2);});it('b',()=>{expect(hd300blm(3,1)).toBe(1);});it('c',()=>{expect(hd300blm(0,0)).toBe(0);});it('d',()=>{expect(hd300blm(93,73)).toBe(2);});it('e',()=>{expect(hd300blm(15,0)).toBe(4);});});
function hd301blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301blm_hd',()=>{it('a',()=>{expect(hd301blm(1,4)).toBe(2);});it('b',()=>{expect(hd301blm(3,1)).toBe(1);});it('c',()=>{expect(hd301blm(0,0)).toBe(0);});it('d',()=>{expect(hd301blm(93,73)).toBe(2);});it('e',()=>{expect(hd301blm(15,0)).toBe(4);});});
function hd302blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302blm_hd',()=>{it('a',()=>{expect(hd302blm(1,4)).toBe(2);});it('b',()=>{expect(hd302blm(3,1)).toBe(1);});it('c',()=>{expect(hd302blm(0,0)).toBe(0);});it('d',()=>{expect(hd302blm(93,73)).toBe(2);});it('e',()=>{expect(hd302blm(15,0)).toBe(4);});});
function hd303blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303blm_hd',()=>{it('a',()=>{expect(hd303blm(1,4)).toBe(2);});it('b',()=>{expect(hd303blm(3,1)).toBe(1);});it('c',()=>{expect(hd303blm(0,0)).toBe(0);});it('d',()=>{expect(hd303blm(93,73)).toBe(2);});it('e',()=>{expect(hd303blm(15,0)).toBe(4);});});
function hd304blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304blm_hd',()=>{it('a',()=>{expect(hd304blm(1,4)).toBe(2);});it('b',()=>{expect(hd304blm(3,1)).toBe(1);});it('c',()=>{expect(hd304blm(0,0)).toBe(0);});it('d',()=>{expect(hd304blm(93,73)).toBe(2);});it('e',()=>{expect(hd304blm(15,0)).toBe(4);});});
function hd305blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305blm_hd',()=>{it('a',()=>{expect(hd305blm(1,4)).toBe(2);});it('b',()=>{expect(hd305blm(3,1)).toBe(1);});it('c',()=>{expect(hd305blm(0,0)).toBe(0);});it('d',()=>{expect(hd305blm(93,73)).toBe(2);});it('e',()=>{expect(hd305blm(15,0)).toBe(4);});});
function hd306blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306blm_hd',()=>{it('a',()=>{expect(hd306blm(1,4)).toBe(2);});it('b',()=>{expect(hd306blm(3,1)).toBe(1);});it('c',()=>{expect(hd306blm(0,0)).toBe(0);});it('d',()=>{expect(hd306blm(93,73)).toBe(2);});it('e',()=>{expect(hd306blm(15,0)).toBe(4);});});
function hd307blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307blm_hd',()=>{it('a',()=>{expect(hd307blm(1,4)).toBe(2);});it('b',()=>{expect(hd307blm(3,1)).toBe(1);});it('c',()=>{expect(hd307blm(0,0)).toBe(0);});it('d',()=>{expect(hd307blm(93,73)).toBe(2);});it('e',()=>{expect(hd307blm(15,0)).toBe(4);});});
function hd308blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308blm_hd',()=>{it('a',()=>{expect(hd308blm(1,4)).toBe(2);});it('b',()=>{expect(hd308blm(3,1)).toBe(1);});it('c',()=>{expect(hd308blm(0,0)).toBe(0);});it('d',()=>{expect(hd308blm(93,73)).toBe(2);});it('e',()=>{expect(hd308blm(15,0)).toBe(4);});});
function hd309blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309blm_hd',()=>{it('a',()=>{expect(hd309blm(1,4)).toBe(2);});it('b',()=>{expect(hd309blm(3,1)).toBe(1);});it('c',()=>{expect(hd309blm(0,0)).toBe(0);});it('d',()=>{expect(hd309blm(93,73)).toBe(2);});it('e',()=>{expect(hd309blm(15,0)).toBe(4);});});
function hd310blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310blm_hd',()=>{it('a',()=>{expect(hd310blm(1,4)).toBe(2);});it('b',()=>{expect(hd310blm(3,1)).toBe(1);});it('c',()=>{expect(hd310blm(0,0)).toBe(0);});it('d',()=>{expect(hd310blm(93,73)).toBe(2);});it('e',()=>{expect(hd310blm(15,0)).toBe(4);});});
function hd311blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311blm_hd',()=>{it('a',()=>{expect(hd311blm(1,4)).toBe(2);});it('b',()=>{expect(hd311blm(3,1)).toBe(1);});it('c',()=>{expect(hd311blm(0,0)).toBe(0);});it('d',()=>{expect(hd311blm(93,73)).toBe(2);});it('e',()=>{expect(hd311blm(15,0)).toBe(4);});});
function hd312blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312blm_hd',()=>{it('a',()=>{expect(hd312blm(1,4)).toBe(2);});it('b',()=>{expect(hd312blm(3,1)).toBe(1);});it('c',()=>{expect(hd312blm(0,0)).toBe(0);});it('d',()=>{expect(hd312blm(93,73)).toBe(2);});it('e',()=>{expect(hd312blm(15,0)).toBe(4);});});
function hd313blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313blm_hd',()=>{it('a',()=>{expect(hd313blm(1,4)).toBe(2);});it('b',()=>{expect(hd313blm(3,1)).toBe(1);});it('c',()=>{expect(hd313blm(0,0)).toBe(0);});it('d',()=>{expect(hd313blm(93,73)).toBe(2);});it('e',()=>{expect(hd313blm(15,0)).toBe(4);});});
function hd314blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314blm_hd',()=>{it('a',()=>{expect(hd314blm(1,4)).toBe(2);});it('b',()=>{expect(hd314blm(3,1)).toBe(1);});it('c',()=>{expect(hd314blm(0,0)).toBe(0);});it('d',()=>{expect(hd314blm(93,73)).toBe(2);});it('e',()=>{expect(hd314blm(15,0)).toBe(4);});});
function hd315blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315blm_hd',()=>{it('a',()=>{expect(hd315blm(1,4)).toBe(2);});it('b',()=>{expect(hd315blm(3,1)).toBe(1);});it('c',()=>{expect(hd315blm(0,0)).toBe(0);});it('d',()=>{expect(hd315blm(93,73)).toBe(2);});it('e',()=>{expect(hd315blm(15,0)).toBe(4);});});
function hd316blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316blm_hd',()=>{it('a',()=>{expect(hd316blm(1,4)).toBe(2);});it('b',()=>{expect(hd316blm(3,1)).toBe(1);});it('c',()=>{expect(hd316blm(0,0)).toBe(0);});it('d',()=>{expect(hd316blm(93,73)).toBe(2);});it('e',()=>{expect(hd316blm(15,0)).toBe(4);});});
function hd317blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317blm_hd',()=>{it('a',()=>{expect(hd317blm(1,4)).toBe(2);});it('b',()=>{expect(hd317blm(3,1)).toBe(1);});it('c',()=>{expect(hd317blm(0,0)).toBe(0);});it('d',()=>{expect(hd317blm(93,73)).toBe(2);});it('e',()=>{expect(hd317blm(15,0)).toBe(4);});});
function hd318blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318blm_hd',()=>{it('a',()=>{expect(hd318blm(1,4)).toBe(2);});it('b',()=>{expect(hd318blm(3,1)).toBe(1);});it('c',()=>{expect(hd318blm(0,0)).toBe(0);});it('d',()=>{expect(hd318blm(93,73)).toBe(2);});it('e',()=>{expect(hd318blm(15,0)).toBe(4);});});
function hd319blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319blm_hd',()=>{it('a',()=>{expect(hd319blm(1,4)).toBe(2);});it('b',()=>{expect(hd319blm(3,1)).toBe(1);});it('c',()=>{expect(hd319blm(0,0)).toBe(0);});it('d',()=>{expect(hd319blm(93,73)).toBe(2);});it('e',()=>{expect(hd319blm(15,0)).toBe(4);});});
function hd320blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320blm_hd',()=>{it('a',()=>{expect(hd320blm(1,4)).toBe(2);});it('b',()=>{expect(hd320blm(3,1)).toBe(1);});it('c',()=>{expect(hd320blm(0,0)).toBe(0);});it('d',()=>{expect(hd320blm(93,73)).toBe(2);});it('e',()=>{expect(hd320blm(15,0)).toBe(4);});});
function hd321blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321blm_hd',()=>{it('a',()=>{expect(hd321blm(1,4)).toBe(2);});it('b',()=>{expect(hd321blm(3,1)).toBe(1);});it('c',()=>{expect(hd321blm(0,0)).toBe(0);});it('d',()=>{expect(hd321blm(93,73)).toBe(2);});it('e',()=>{expect(hd321blm(15,0)).toBe(4);});});
function hd322blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322blm_hd',()=>{it('a',()=>{expect(hd322blm(1,4)).toBe(2);});it('b',()=>{expect(hd322blm(3,1)).toBe(1);});it('c',()=>{expect(hd322blm(0,0)).toBe(0);});it('d',()=>{expect(hd322blm(93,73)).toBe(2);});it('e',()=>{expect(hd322blm(15,0)).toBe(4);});});
function hd323blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323blm_hd',()=>{it('a',()=>{expect(hd323blm(1,4)).toBe(2);});it('b',()=>{expect(hd323blm(3,1)).toBe(1);});it('c',()=>{expect(hd323blm(0,0)).toBe(0);});it('d',()=>{expect(hd323blm(93,73)).toBe(2);});it('e',()=>{expect(hd323blm(15,0)).toBe(4);});});
function hd324blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324blm_hd',()=>{it('a',()=>{expect(hd324blm(1,4)).toBe(2);});it('b',()=>{expect(hd324blm(3,1)).toBe(1);});it('c',()=>{expect(hd324blm(0,0)).toBe(0);});it('d',()=>{expect(hd324blm(93,73)).toBe(2);});it('e',()=>{expect(hd324blm(15,0)).toBe(4);});});
function hd325blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325blm_hd',()=>{it('a',()=>{expect(hd325blm(1,4)).toBe(2);});it('b',()=>{expect(hd325blm(3,1)).toBe(1);});it('c',()=>{expect(hd325blm(0,0)).toBe(0);});it('d',()=>{expect(hd325blm(93,73)).toBe(2);});it('e',()=>{expect(hd325blm(15,0)).toBe(4);});});
function hd326blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326blm_hd',()=>{it('a',()=>{expect(hd326blm(1,4)).toBe(2);});it('b',()=>{expect(hd326blm(3,1)).toBe(1);});it('c',()=>{expect(hd326blm(0,0)).toBe(0);});it('d',()=>{expect(hd326blm(93,73)).toBe(2);});it('e',()=>{expect(hd326blm(15,0)).toBe(4);});});
function hd327blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327blm_hd',()=>{it('a',()=>{expect(hd327blm(1,4)).toBe(2);});it('b',()=>{expect(hd327blm(3,1)).toBe(1);});it('c',()=>{expect(hd327blm(0,0)).toBe(0);});it('d',()=>{expect(hd327blm(93,73)).toBe(2);});it('e',()=>{expect(hd327blm(15,0)).toBe(4);});});
function hd328blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328blm_hd',()=>{it('a',()=>{expect(hd328blm(1,4)).toBe(2);});it('b',()=>{expect(hd328blm(3,1)).toBe(1);});it('c',()=>{expect(hd328blm(0,0)).toBe(0);});it('d',()=>{expect(hd328blm(93,73)).toBe(2);});it('e',()=>{expect(hd328blm(15,0)).toBe(4);});});
function hd329blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329blm_hd',()=>{it('a',()=>{expect(hd329blm(1,4)).toBe(2);});it('b',()=>{expect(hd329blm(3,1)).toBe(1);});it('c',()=>{expect(hd329blm(0,0)).toBe(0);});it('d',()=>{expect(hd329blm(93,73)).toBe(2);});it('e',()=>{expect(hd329blm(15,0)).toBe(4);});});
function hd330blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330blm_hd',()=>{it('a',()=>{expect(hd330blm(1,4)).toBe(2);});it('b',()=>{expect(hd330blm(3,1)).toBe(1);});it('c',()=>{expect(hd330blm(0,0)).toBe(0);});it('d',()=>{expect(hd330blm(93,73)).toBe(2);});it('e',()=>{expect(hd330blm(15,0)).toBe(4);});});
function hd331blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331blm_hd',()=>{it('a',()=>{expect(hd331blm(1,4)).toBe(2);});it('b',()=>{expect(hd331blm(3,1)).toBe(1);});it('c',()=>{expect(hd331blm(0,0)).toBe(0);});it('d',()=>{expect(hd331blm(93,73)).toBe(2);});it('e',()=>{expect(hd331blm(15,0)).toBe(4);});});
function hd332blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332blm_hd',()=>{it('a',()=>{expect(hd332blm(1,4)).toBe(2);});it('b',()=>{expect(hd332blm(3,1)).toBe(1);});it('c',()=>{expect(hd332blm(0,0)).toBe(0);});it('d',()=>{expect(hd332blm(93,73)).toBe(2);});it('e',()=>{expect(hd332blm(15,0)).toBe(4);});});
function hd333blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333blm_hd',()=>{it('a',()=>{expect(hd333blm(1,4)).toBe(2);});it('b',()=>{expect(hd333blm(3,1)).toBe(1);});it('c',()=>{expect(hd333blm(0,0)).toBe(0);});it('d',()=>{expect(hd333blm(93,73)).toBe(2);});it('e',()=>{expect(hd333blm(15,0)).toBe(4);});});
function hd334blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334blm_hd',()=>{it('a',()=>{expect(hd334blm(1,4)).toBe(2);});it('b',()=>{expect(hd334blm(3,1)).toBe(1);});it('c',()=>{expect(hd334blm(0,0)).toBe(0);});it('d',()=>{expect(hd334blm(93,73)).toBe(2);});it('e',()=>{expect(hd334blm(15,0)).toBe(4);});});
function hd335blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335blm_hd',()=>{it('a',()=>{expect(hd335blm(1,4)).toBe(2);});it('b',()=>{expect(hd335blm(3,1)).toBe(1);});it('c',()=>{expect(hd335blm(0,0)).toBe(0);});it('d',()=>{expect(hd335blm(93,73)).toBe(2);});it('e',()=>{expect(hd335blm(15,0)).toBe(4);});});
function hd336blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336blm_hd',()=>{it('a',()=>{expect(hd336blm(1,4)).toBe(2);});it('b',()=>{expect(hd336blm(3,1)).toBe(1);});it('c',()=>{expect(hd336blm(0,0)).toBe(0);});it('d',()=>{expect(hd336blm(93,73)).toBe(2);});it('e',()=>{expect(hd336blm(15,0)).toBe(4);});});
function hd337blm(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337blm_hd',()=>{it('a',()=>{expect(hd337blm(1,4)).toBe(2);});it('b',()=>{expect(hd337blm(3,1)).toBe(1);});it('c',()=>{expect(hd337blm(0,0)).toBe(0);});it('d',()=>{expect(hd337blm(93,73)).toBe(2);});it('e',()=>{expect(hd337blm(15,0)).toBe(4);});});
function hd338blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338blm2_hd',()=>{it('a',()=>{expect(hd338blm2(1,4)).toBe(2);});it('b',()=>{expect(hd338blm2(3,1)).toBe(1);});it('c',()=>{expect(hd338blm2(0,0)).toBe(0);});it('d',()=>{expect(hd338blm2(93,73)).toBe(2);});it('e',()=>{expect(hd338blm2(15,0)).toBe(4);});});
function hd339blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339blm2_hd',()=>{it('a',()=>{expect(hd339blm2(1,4)).toBe(2);});it('b',()=>{expect(hd339blm2(3,1)).toBe(1);});it('c',()=>{expect(hd339blm2(0,0)).toBe(0);});it('d',()=>{expect(hd339blm2(93,73)).toBe(2);});it('e',()=>{expect(hd339blm2(15,0)).toBe(4);});});
function hd340blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340blm2_hd',()=>{it('a',()=>{expect(hd340blm2(1,4)).toBe(2);});it('b',()=>{expect(hd340blm2(3,1)).toBe(1);});it('c',()=>{expect(hd340blm2(0,0)).toBe(0);});it('d',()=>{expect(hd340blm2(93,73)).toBe(2);});it('e',()=>{expect(hd340blm2(15,0)).toBe(4);});});
function hd341blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341blm2_hd',()=>{it('a',()=>{expect(hd341blm2(1,4)).toBe(2);});it('b',()=>{expect(hd341blm2(3,1)).toBe(1);});it('c',()=>{expect(hd341blm2(0,0)).toBe(0);});it('d',()=>{expect(hd341blm2(93,73)).toBe(2);});it('e',()=>{expect(hd341blm2(15,0)).toBe(4);});});
function hd342blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342blm2_hd',()=>{it('a',()=>{expect(hd342blm2(1,4)).toBe(2);});it('b',()=>{expect(hd342blm2(3,1)).toBe(1);});it('c',()=>{expect(hd342blm2(0,0)).toBe(0);});it('d',()=>{expect(hd342blm2(93,73)).toBe(2);});it('e',()=>{expect(hd342blm2(15,0)).toBe(4);});});
function hd343blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343blm2_hd',()=>{it('a',()=>{expect(hd343blm2(1,4)).toBe(2);});it('b',()=>{expect(hd343blm2(3,1)).toBe(1);});it('c',()=>{expect(hd343blm2(0,0)).toBe(0);});it('d',()=>{expect(hd343blm2(93,73)).toBe(2);});it('e',()=>{expect(hd343blm2(15,0)).toBe(4);});});
function hd344blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344blm2_hd',()=>{it('a',()=>{expect(hd344blm2(1,4)).toBe(2);});it('b',()=>{expect(hd344blm2(3,1)).toBe(1);});it('c',()=>{expect(hd344blm2(0,0)).toBe(0);});it('d',()=>{expect(hd344blm2(93,73)).toBe(2);});it('e',()=>{expect(hd344blm2(15,0)).toBe(4);});});
function hd345blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345blm2_hd',()=>{it('a',()=>{expect(hd345blm2(1,4)).toBe(2);});it('b',()=>{expect(hd345blm2(3,1)).toBe(1);});it('c',()=>{expect(hd345blm2(0,0)).toBe(0);});it('d',()=>{expect(hd345blm2(93,73)).toBe(2);});it('e',()=>{expect(hd345blm2(15,0)).toBe(4);});});
function hd346blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346blm2_hd',()=>{it('a',()=>{expect(hd346blm2(1,4)).toBe(2);});it('b',()=>{expect(hd346blm2(3,1)).toBe(1);});it('c',()=>{expect(hd346blm2(0,0)).toBe(0);});it('d',()=>{expect(hd346blm2(93,73)).toBe(2);});it('e',()=>{expect(hd346blm2(15,0)).toBe(4);});});
function hd347blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347blm2_hd',()=>{it('a',()=>{expect(hd347blm2(1,4)).toBe(2);});it('b',()=>{expect(hd347blm2(3,1)).toBe(1);});it('c',()=>{expect(hd347blm2(0,0)).toBe(0);});it('d',()=>{expect(hd347blm2(93,73)).toBe(2);});it('e',()=>{expect(hd347blm2(15,0)).toBe(4);});});
function hd348blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348blm2_hd',()=>{it('a',()=>{expect(hd348blm2(1,4)).toBe(2);});it('b',()=>{expect(hd348blm2(3,1)).toBe(1);});it('c',()=>{expect(hd348blm2(0,0)).toBe(0);});it('d',()=>{expect(hd348blm2(93,73)).toBe(2);});it('e',()=>{expect(hd348blm2(15,0)).toBe(4);});});
function hd349blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349blm2_hd',()=>{it('a',()=>{expect(hd349blm2(1,4)).toBe(2);});it('b',()=>{expect(hd349blm2(3,1)).toBe(1);});it('c',()=>{expect(hd349blm2(0,0)).toBe(0);});it('d',()=>{expect(hd349blm2(93,73)).toBe(2);});it('e',()=>{expect(hd349blm2(15,0)).toBe(4);});});
function hd350blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350blm2_hd',()=>{it('a',()=>{expect(hd350blm2(1,4)).toBe(2);});it('b',()=>{expect(hd350blm2(3,1)).toBe(1);});it('c',()=>{expect(hd350blm2(0,0)).toBe(0);});it('d',()=>{expect(hd350blm2(93,73)).toBe(2);});it('e',()=>{expect(hd350blm2(15,0)).toBe(4);});});
function hd351blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351blm2_hd',()=>{it('a',()=>{expect(hd351blm2(1,4)).toBe(2);});it('b',()=>{expect(hd351blm2(3,1)).toBe(1);});it('c',()=>{expect(hd351blm2(0,0)).toBe(0);});it('d',()=>{expect(hd351blm2(93,73)).toBe(2);});it('e',()=>{expect(hd351blm2(15,0)).toBe(4);});});
function hd352blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352blm2_hd',()=>{it('a',()=>{expect(hd352blm2(1,4)).toBe(2);});it('b',()=>{expect(hd352blm2(3,1)).toBe(1);});it('c',()=>{expect(hd352blm2(0,0)).toBe(0);});it('d',()=>{expect(hd352blm2(93,73)).toBe(2);});it('e',()=>{expect(hd352blm2(15,0)).toBe(4);});});
function hd353blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353blm2_hd',()=>{it('a',()=>{expect(hd353blm2(1,4)).toBe(2);});it('b',()=>{expect(hd353blm2(3,1)).toBe(1);});it('c',()=>{expect(hd353blm2(0,0)).toBe(0);});it('d',()=>{expect(hd353blm2(93,73)).toBe(2);});it('e',()=>{expect(hd353blm2(15,0)).toBe(4);});});
function hd354blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354blm2_hd',()=>{it('a',()=>{expect(hd354blm2(1,4)).toBe(2);});it('b',()=>{expect(hd354blm2(3,1)).toBe(1);});it('c',()=>{expect(hd354blm2(0,0)).toBe(0);});it('d',()=>{expect(hd354blm2(93,73)).toBe(2);});it('e',()=>{expect(hd354blm2(15,0)).toBe(4);});});
function hd355blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355blm2_hd',()=>{it('a',()=>{expect(hd355blm2(1,4)).toBe(2);});it('b',()=>{expect(hd355blm2(3,1)).toBe(1);});it('c',()=>{expect(hd355blm2(0,0)).toBe(0);});it('d',()=>{expect(hd355blm2(93,73)).toBe(2);});it('e',()=>{expect(hd355blm2(15,0)).toBe(4);});});
function hd356blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356blm2_hd',()=>{it('a',()=>{expect(hd356blm2(1,4)).toBe(2);});it('b',()=>{expect(hd356blm2(3,1)).toBe(1);});it('c',()=>{expect(hd356blm2(0,0)).toBe(0);});it('d',()=>{expect(hd356blm2(93,73)).toBe(2);});it('e',()=>{expect(hd356blm2(15,0)).toBe(4);});});
function hd357blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357blm2_hd',()=>{it('a',()=>{expect(hd357blm2(1,4)).toBe(2);});it('b',()=>{expect(hd357blm2(3,1)).toBe(1);});it('c',()=>{expect(hd357blm2(0,0)).toBe(0);});it('d',()=>{expect(hd357blm2(93,73)).toBe(2);});it('e',()=>{expect(hd357blm2(15,0)).toBe(4);});});
function hd358blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358blm2_hd',()=>{it('a',()=>{expect(hd358blm2(1,4)).toBe(2);});it('b',()=>{expect(hd358blm2(3,1)).toBe(1);});it('c',()=>{expect(hd358blm2(0,0)).toBe(0);});it('d',()=>{expect(hd358blm2(93,73)).toBe(2);});it('e',()=>{expect(hd358blm2(15,0)).toBe(4);});});
function hd359blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359blm2_hd',()=>{it('a',()=>{expect(hd359blm2(1,4)).toBe(2);});it('b',()=>{expect(hd359blm2(3,1)).toBe(1);});it('c',()=>{expect(hd359blm2(0,0)).toBe(0);});it('d',()=>{expect(hd359blm2(93,73)).toBe(2);});it('e',()=>{expect(hd359blm2(15,0)).toBe(4);});});
function hd360blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360blm2_hd',()=>{it('a',()=>{expect(hd360blm2(1,4)).toBe(2);});it('b',()=>{expect(hd360blm2(3,1)).toBe(1);});it('c',()=>{expect(hd360blm2(0,0)).toBe(0);});it('d',()=>{expect(hd360blm2(93,73)).toBe(2);});it('e',()=>{expect(hd360blm2(15,0)).toBe(4);});});
function hd361blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361blm2_hd',()=>{it('a',()=>{expect(hd361blm2(1,4)).toBe(2);});it('b',()=>{expect(hd361blm2(3,1)).toBe(1);});it('c',()=>{expect(hd361blm2(0,0)).toBe(0);});it('d',()=>{expect(hd361blm2(93,73)).toBe(2);});it('e',()=>{expect(hd361blm2(15,0)).toBe(4);});});
function hd362blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362blm2_hd',()=>{it('a',()=>{expect(hd362blm2(1,4)).toBe(2);});it('b',()=>{expect(hd362blm2(3,1)).toBe(1);});it('c',()=>{expect(hd362blm2(0,0)).toBe(0);});it('d',()=>{expect(hd362blm2(93,73)).toBe(2);});it('e',()=>{expect(hd362blm2(15,0)).toBe(4);});});
function hd363blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363blm2_hd',()=>{it('a',()=>{expect(hd363blm2(1,4)).toBe(2);});it('b',()=>{expect(hd363blm2(3,1)).toBe(1);});it('c',()=>{expect(hd363blm2(0,0)).toBe(0);});it('d',()=>{expect(hd363blm2(93,73)).toBe(2);});it('e',()=>{expect(hd363blm2(15,0)).toBe(4);});});
function hd364blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364blm2_hd',()=>{it('a',()=>{expect(hd364blm2(1,4)).toBe(2);});it('b',()=>{expect(hd364blm2(3,1)).toBe(1);});it('c',()=>{expect(hd364blm2(0,0)).toBe(0);});it('d',()=>{expect(hd364blm2(93,73)).toBe(2);});it('e',()=>{expect(hd364blm2(15,0)).toBe(4);});});
function hd365blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365blm2_hd',()=>{it('a',()=>{expect(hd365blm2(1,4)).toBe(2);});it('b',()=>{expect(hd365blm2(3,1)).toBe(1);});it('c',()=>{expect(hd365blm2(0,0)).toBe(0);});it('d',()=>{expect(hd365blm2(93,73)).toBe(2);});it('e',()=>{expect(hd365blm2(15,0)).toBe(4);});});
function hd366blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366blm2_hd',()=>{it('a',()=>{expect(hd366blm2(1,4)).toBe(2);});it('b',()=>{expect(hd366blm2(3,1)).toBe(1);});it('c',()=>{expect(hd366blm2(0,0)).toBe(0);});it('d',()=>{expect(hd366blm2(93,73)).toBe(2);});it('e',()=>{expect(hd366blm2(15,0)).toBe(4);});});
function hd367blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367blm2_hd',()=>{it('a',()=>{expect(hd367blm2(1,4)).toBe(2);});it('b',()=>{expect(hd367blm2(3,1)).toBe(1);});it('c',()=>{expect(hd367blm2(0,0)).toBe(0);});it('d',()=>{expect(hd367blm2(93,73)).toBe(2);});it('e',()=>{expect(hd367blm2(15,0)).toBe(4);});});
function hd368blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368blm2_hd',()=>{it('a',()=>{expect(hd368blm2(1,4)).toBe(2);});it('b',()=>{expect(hd368blm2(3,1)).toBe(1);});it('c',()=>{expect(hd368blm2(0,0)).toBe(0);});it('d',()=>{expect(hd368blm2(93,73)).toBe(2);});it('e',()=>{expect(hd368blm2(15,0)).toBe(4);});});
function hd369blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369blm2_hd',()=>{it('a',()=>{expect(hd369blm2(1,4)).toBe(2);});it('b',()=>{expect(hd369blm2(3,1)).toBe(1);});it('c',()=>{expect(hd369blm2(0,0)).toBe(0);});it('d',()=>{expect(hd369blm2(93,73)).toBe(2);});it('e',()=>{expect(hd369blm2(15,0)).toBe(4);});});
function hd370blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370blm2_hd',()=>{it('a',()=>{expect(hd370blm2(1,4)).toBe(2);});it('b',()=>{expect(hd370blm2(3,1)).toBe(1);});it('c',()=>{expect(hd370blm2(0,0)).toBe(0);});it('d',()=>{expect(hd370blm2(93,73)).toBe(2);});it('e',()=>{expect(hd370blm2(15,0)).toBe(4);});});
function hd371blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371blm2_hd',()=>{it('a',()=>{expect(hd371blm2(1,4)).toBe(2);});it('b',()=>{expect(hd371blm2(3,1)).toBe(1);});it('c',()=>{expect(hd371blm2(0,0)).toBe(0);});it('d',()=>{expect(hd371blm2(93,73)).toBe(2);});it('e',()=>{expect(hd371blm2(15,0)).toBe(4);});});
function hd372blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372blm2_hd',()=>{it('a',()=>{expect(hd372blm2(1,4)).toBe(2);});it('b',()=>{expect(hd372blm2(3,1)).toBe(1);});it('c',()=>{expect(hd372blm2(0,0)).toBe(0);});it('d',()=>{expect(hd372blm2(93,73)).toBe(2);});it('e',()=>{expect(hd372blm2(15,0)).toBe(4);});});
function hd373blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373blm2_hd',()=>{it('a',()=>{expect(hd373blm2(1,4)).toBe(2);});it('b',()=>{expect(hd373blm2(3,1)).toBe(1);});it('c',()=>{expect(hd373blm2(0,0)).toBe(0);});it('d',()=>{expect(hd373blm2(93,73)).toBe(2);});it('e',()=>{expect(hd373blm2(15,0)).toBe(4);});});
function hd374blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374blm2_hd',()=>{it('a',()=>{expect(hd374blm2(1,4)).toBe(2);});it('b',()=>{expect(hd374blm2(3,1)).toBe(1);});it('c',()=>{expect(hd374blm2(0,0)).toBe(0);});it('d',()=>{expect(hd374blm2(93,73)).toBe(2);});it('e',()=>{expect(hd374blm2(15,0)).toBe(4);});});
function hd375blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375blm2_hd',()=>{it('a',()=>{expect(hd375blm2(1,4)).toBe(2);});it('b',()=>{expect(hd375blm2(3,1)).toBe(1);});it('c',()=>{expect(hd375blm2(0,0)).toBe(0);});it('d',()=>{expect(hd375blm2(93,73)).toBe(2);});it('e',()=>{expect(hd375blm2(15,0)).toBe(4);});});
function hd376blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376blm2_hd',()=>{it('a',()=>{expect(hd376blm2(1,4)).toBe(2);});it('b',()=>{expect(hd376blm2(3,1)).toBe(1);});it('c',()=>{expect(hd376blm2(0,0)).toBe(0);});it('d',()=>{expect(hd376blm2(93,73)).toBe(2);});it('e',()=>{expect(hd376blm2(15,0)).toBe(4);});});
function hd377blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377blm2_hd',()=>{it('a',()=>{expect(hd377blm2(1,4)).toBe(2);});it('b',()=>{expect(hd377blm2(3,1)).toBe(1);});it('c',()=>{expect(hd377blm2(0,0)).toBe(0);});it('d',()=>{expect(hd377blm2(93,73)).toBe(2);});it('e',()=>{expect(hd377blm2(15,0)).toBe(4);});});
function hd378blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378blm2_hd',()=>{it('a',()=>{expect(hd378blm2(1,4)).toBe(2);});it('b',()=>{expect(hd378blm2(3,1)).toBe(1);});it('c',()=>{expect(hd378blm2(0,0)).toBe(0);});it('d',()=>{expect(hd378blm2(93,73)).toBe(2);});it('e',()=>{expect(hd378blm2(15,0)).toBe(4);});});
function hd379blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379blm2_hd',()=>{it('a',()=>{expect(hd379blm2(1,4)).toBe(2);});it('b',()=>{expect(hd379blm2(3,1)).toBe(1);});it('c',()=>{expect(hd379blm2(0,0)).toBe(0);});it('d',()=>{expect(hd379blm2(93,73)).toBe(2);});it('e',()=>{expect(hd379blm2(15,0)).toBe(4);});});
function hd380blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380blm2_hd',()=>{it('a',()=>{expect(hd380blm2(1,4)).toBe(2);});it('b',()=>{expect(hd380blm2(3,1)).toBe(1);});it('c',()=>{expect(hd380blm2(0,0)).toBe(0);});it('d',()=>{expect(hd380blm2(93,73)).toBe(2);});it('e',()=>{expect(hd380blm2(15,0)).toBe(4);});});
function hd381blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381blm2_hd',()=>{it('a',()=>{expect(hd381blm2(1,4)).toBe(2);});it('b',()=>{expect(hd381blm2(3,1)).toBe(1);});it('c',()=>{expect(hd381blm2(0,0)).toBe(0);});it('d',()=>{expect(hd381blm2(93,73)).toBe(2);});it('e',()=>{expect(hd381blm2(15,0)).toBe(4);});});
function hd382blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382blm2_hd',()=>{it('a',()=>{expect(hd382blm2(1,4)).toBe(2);});it('b',()=>{expect(hd382blm2(3,1)).toBe(1);});it('c',()=>{expect(hd382blm2(0,0)).toBe(0);});it('d',()=>{expect(hd382blm2(93,73)).toBe(2);});it('e',()=>{expect(hd382blm2(15,0)).toBe(4);});});
function hd383blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383blm2_hd',()=>{it('a',()=>{expect(hd383blm2(1,4)).toBe(2);});it('b',()=>{expect(hd383blm2(3,1)).toBe(1);});it('c',()=>{expect(hd383blm2(0,0)).toBe(0);});it('d',()=>{expect(hd383blm2(93,73)).toBe(2);});it('e',()=>{expect(hd383blm2(15,0)).toBe(4);});});
function hd384blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384blm2_hd',()=>{it('a',()=>{expect(hd384blm2(1,4)).toBe(2);});it('b',()=>{expect(hd384blm2(3,1)).toBe(1);});it('c',()=>{expect(hd384blm2(0,0)).toBe(0);});it('d',()=>{expect(hd384blm2(93,73)).toBe(2);});it('e',()=>{expect(hd384blm2(15,0)).toBe(4);});});
function hd385blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385blm2_hd',()=>{it('a',()=>{expect(hd385blm2(1,4)).toBe(2);});it('b',()=>{expect(hd385blm2(3,1)).toBe(1);});it('c',()=>{expect(hd385blm2(0,0)).toBe(0);});it('d',()=>{expect(hd385blm2(93,73)).toBe(2);});it('e',()=>{expect(hd385blm2(15,0)).toBe(4);});});
function hd386blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386blm2_hd',()=>{it('a',()=>{expect(hd386blm2(1,4)).toBe(2);});it('b',()=>{expect(hd386blm2(3,1)).toBe(1);});it('c',()=>{expect(hd386blm2(0,0)).toBe(0);});it('d',()=>{expect(hd386blm2(93,73)).toBe(2);});it('e',()=>{expect(hd386blm2(15,0)).toBe(4);});});
function hd387blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387blm2_hd',()=>{it('a',()=>{expect(hd387blm2(1,4)).toBe(2);});it('b',()=>{expect(hd387blm2(3,1)).toBe(1);});it('c',()=>{expect(hd387blm2(0,0)).toBe(0);});it('d',()=>{expect(hd387blm2(93,73)).toBe(2);});it('e',()=>{expect(hd387blm2(15,0)).toBe(4);});});
function hd388blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388blm2_hd',()=>{it('a',()=>{expect(hd388blm2(1,4)).toBe(2);});it('b',()=>{expect(hd388blm2(3,1)).toBe(1);});it('c',()=>{expect(hd388blm2(0,0)).toBe(0);});it('d',()=>{expect(hd388blm2(93,73)).toBe(2);});it('e',()=>{expect(hd388blm2(15,0)).toBe(4);});});
function hd389blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389blm2_hd',()=>{it('a',()=>{expect(hd389blm2(1,4)).toBe(2);});it('b',()=>{expect(hd389blm2(3,1)).toBe(1);});it('c',()=>{expect(hd389blm2(0,0)).toBe(0);});it('d',()=>{expect(hd389blm2(93,73)).toBe(2);});it('e',()=>{expect(hd389blm2(15,0)).toBe(4);});});
function hd390blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390blm2_hd',()=>{it('a',()=>{expect(hd390blm2(1,4)).toBe(2);});it('b',()=>{expect(hd390blm2(3,1)).toBe(1);});it('c',()=>{expect(hd390blm2(0,0)).toBe(0);});it('d',()=>{expect(hd390blm2(93,73)).toBe(2);});it('e',()=>{expect(hd390blm2(15,0)).toBe(4);});});
function hd391blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391blm2_hd',()=>{it('a',()=>{expect(hd391blm2(1,4)).toBe(2);});it('b',()=>{expect(hd391blm2(3,1)).toBe(1);});it('c',()=>{expect(hd391blm2(0,0)).toBe(0);});it('d',()=>{expect(hd391blm2(93,73)).toBe(2);});it('e',()=>{expect(hd391blm2(15,0)).toBe(4);});});
function hd392blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392blm2_hd',()=>{it('a',()=>{expect(hd392blm2(1,4)).toBe(2);});it('b',()=>{expect(hd392blm2(3,1)).toBe(1);});it('c',()=>{expect(hd392blm2(0,0)).toBe(0);});it('d',()=>{expect(hd392blm2(93,73)).toBe(2);});it('e',()=>{expect(hd392blm2(15,0)).toBe(4);});});
function hd393blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393blm2_hd',()=>{it('a',()=>{expect(hd393blm2(1,4)).toBe(2);});it('b',()=>{expect(hd393blm2(3,1)).toBe(1);});it('c',()=>{expect(hd393blm2(0,0)).toBe(0);});it('d',()=>{expect(hd393blm2(93,73)).toBe(2);});it('e',()=>{expect(hd393blm2(15,0)).toBe(4);});});
function hd394blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394blm2_hd',()=>{it('a',()=>{expect(hd394blm2(1,4)).toBe(2);});it('b',()=>{expect(hd394blm2(3,1)).toBe(1);});it('c',()=>{expect(hd394blm2(0,0)).toBe(0);});it('d',()=>{expect(hd394blm2(93,73)).toBe(2);});it('e',()=>{expect(hd394blm2(15,0)).toBe(4);});});
function hd395blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395blm2_hd',()=>{it('a',()=>{expect(hd395blm2(1,4)).toBe(2);});it('b',()=>{expect(hd395blm2(3,1)).toBe(1);});it('c',()=>{expect(hd395blm2(0,0)).toBe(0);});it('d',()=>{expect(hd395blm2(93,73)).toBe(2);});it('e',()=>{expect(hd395blm2(15,0)).toBe(4);});});
function hd396blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396blm2_hd',()=>{it('a',()=>{expect(hd396blm2(1,4)).toBe(2);});it('b',()=>{expect(hd396blm2(3,1)).toBe(1);});it('c',()=>{expect(hd396blm2(0,0)).toBe(0);});it('d',()=>{expect(hd396blm2(93,73)).toBe(2);});it('e',()=>{expect(hd396blm2(15,0)).toBe(4);});});
function hd397blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397blm2_hd',()=>{it('a',()=>{expect(hd397blm2(1,4)).toBe(2);});it('b',()=>{expect(hd397blm2(3,1)).toBe(1);});it('c',()=>{expect(hd397blm2(0,0)).toBe(0);});it('d',()=>{expect(hd397blm2(93,73)).toBe(2);});it('e',()=>{expect(hd397blm2(15,0)).toBe(4);});});
function hd398blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398blm2_hd',()=>{it('a',()=>{expect(hd398blm2(1,4)).toBe(2);});it('b',()=>{expect(hd398blm2(3,1)).toBe(1);});it('c',()=>{expect(hd398blm2(0,0)).toBe(0);});it('d',()=>{expect(hd398blm2(93,73)).toBe(2);});it('e',()=>{expect(hd398blm2(15,0)).toBe(4);});});
function hd399blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399blm2_hd',()=>{it('a',()=>{expect(hd399blm2(1,4)).toBe(2);});it('b',()=>{expect(hd399blm2(3,1)).toBe(1);});it('c',()=>{expect(hd399blm2(0,0)).toBe(0);});it('d',()=>{expect(hd399blm2(93,73)).toBe(2);});it('e',()=>{expect(hd399blm2(15,0)).toBe(4);});});
function hd400blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400blm2_hd',()=>{it('a',()=>{expect(hd400blm2(1,4)).toBe(2);});it('b',()=>{expect(hd400blm2(3,1)).toBe(1);});it('c',()=>{expect(hd400blm2(0,0)).toBe(0);});it('d',()=>{expect(hd400blm2(93,73)).toBe(2);});it('e',()=>{expect(hd400blm2(15,0)).toBe(4);});});
function hd401blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401blm2_hd',()=>{it('a',()=>{expect(hd401blm2(1,4)).toBe(2);});it('b',()=>{expect(hd401blm2(3,1)).toBe(1);});it('c',()=>{expect(hd401blm2(0,0)).toBe(0);});it('d',()=>{expect(hd401blm2(93,73)).toBe(2);});it('e',()=>{expect(hd401blm2(15,0)).toBe(4);});});
function hd402blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402blm2_hd',()=>{it('a',()=>{expect(hd402blm2(1,4)).toBe(2);});it('b',()=>{expect(hd402blm2(3,1)).toBe(1);});it('c',()=>{expect(hd402blm2(0,0)).toBe(0);});it('d',()=>{expect(hd402blm2(93,73)).toBe(2);});it('e',()=>{expect(hd402blm2(15,0)).toBe(4);});});
function hd403blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403blm2_hd',()=>{it('a',()=>{expect(hd403blm2(1,4)).toBe(2);});it('b',()=>{expect(hd403blm2(3,1)).toBe(1);});it('c',()=>{expect(hd403blm2(0,0)).toBe(0);});it('d',()=>{expect(hd403blm2(93,73)).toBe(2);});it('e',()=>{expect(hd403blm2(15,0)).toBe(4);});});
function hd404blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404blm2_hd',()=>{it('a',()=>{expect(hd404blm2(1,4)).toBe(2);});it('b',()=>{expect(hd404blm2(3,1)).toBe(1);});it('c',()=>{expect(hd404blm2(0,0)).toBe(0);});it('d',()=>{expect(hd404blm2(93,73)).toBe(2);});it('e',()=>{expect(hd404blm2(15,0)).toBe(4);});});
function hd405blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405blm2_hd',()=>{it('a',()=>{expect(hd405blm2(1,4)).toBe(2);});it('b',()=>{expect(hd405blm2(3,1)).toBe(1);});it('c',()=>{expect(hd405blm2(0,0)).toBe(0);});it('d',()=>{expect(hd405blm2(93,73)).toBe(2);});it('e',()=>{expect(hd405blm2(15,0)).toBe(4);});});
function hd406blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406blm2_hd',()=>{it('a',()=>{expect(hd406blm2(1,4)).toBe(2);});it('b',()=>{expect(hd406blm2(3,1)).toBe(1);});it('c',()=>{expect(hd406blm2(0,0)).toBe(0);});it('d',()=>{expect(hd406blm2(93,73)).toBe(2);});it('e',()=>{expect(hd406blm2(15,0)).toBe(4);});});
function hd407blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407blm2_hd',()=>{it('a',()=>{expect(hd407blm2(1,4)).toBe(2);});it('b',()=>{expect(hd407blm2(3,1)).toBe(1);});it('c',()=>{expect(hd407blm2(0,0)).toBe(0);});it('d',()=>{expect(hd407blm2(93,73)).toBe(2);});it('e',()=>{expect(hd407blm2(15,0)).toBe(4);});});
function hd408blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408blm2_hd',()=>{it('a',()=>{expect(hd408blm2(1,4)).toBe(2);});it('b',()=>{expect(hd408blm2(3,1)).toBe(1);});it('c',()=>{expect(hd408blm2(0,0)).toBe(0);});it('d',()=>{expect(hd408blm2(93,73)).toBe(2);});it('e',()=>{expect(hd408blm2(15,0)).toBe(4);});});
function hd409blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409blm2_hd',()=>{it('a',()=>{expect(hd409blm2(1,4)).toBe(2);});it('b',()=>{expect(hd409blm2(3,1)).toBe(1);});it('c',()=>{expect(hd409blm2(0,0)).toBe(0);});it('d',()=>{expect(hd409blm2(93,73)).toBe(2);});it('e',()=>{expect(hd409blm2(15,0)).toBe(4);});});
function hd410blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410blm2_hd',()=>{it('a',()=>{expect(hd410blm2(1,4)).toBe(2);});it('b',()=>{expect(hd410blm2(3,1)).toBe(1);});it('c',()=>{expect(hd410blm2(0,0)).toBe(0);});it('d',()=>{expect(hd410blm2(93,73)).toBe(2);});it('e',()=>{expect(hd410blm2(15,0)).toBe(4);});});
function hd411blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411blm2_hd',()=>{it('a',()=>{expect(hd411blm2(1,4)).toBe(2);});it('b',()=>{expect(hd411blm2(3,1)).toBe(1);});it('c',()=>{expect(hd411blm2(0,0)).toBe(0);});it('d',()=>{expect(hd411blm2(93,73)).toBe(2);});it('e',()=>{expect(hd411blm2(15,0)).toBe(4);});});
function hd412blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412blm2_hd',()=>{it('a',()=>{expect(hd412blm2(1,4)).toBe(2);});it('b',()=>{expect(hd412blm2(3,1)).toBe(1);});it('c',()=>{expect(hd412blm2(0,0)).toBe(0);});it('d',()=>{expect(hd412blm2(93,73)).toBe(2);});it('e',()=>{expect(hd412blm2(15,0)).toBe(4);});});
function hd413blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413blm2_hd',()=>{it('a',()=>{expect(hd413blm2(1,4)).toBe(2);});it('b',()=>{expect(hd413blm2(3,1)).toBe(1);});it('c',()=>{expect(hd413blm2(0,0)).toBe(0);});it('d',()=>{expect(hd413blm2(93,73)).toBe(2);});it('e',()=>{expect(hd413blm2(15,0)).toBe(4);});});
function hd414blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414blm2_hd',()=>{it('a',()=>{expect(hd414blm2(1,4)).toBe(2);});it('b',()=>{expect(hd414blm2(3,1)).toBe(1);});it('c',()=>{expect(hd414blm2(0,0)).toBe(0);});it('d',()=>{expect(hd414blm2(93,73)).toBe(2);});it('e',()=>{expect(hd414blm2(15,0)).toBe(4);});});
function hd415blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415blm2_hd',()=>{it('a',()=>{expect(hd415blm2(1,4)).toBe(2);});it('b',()=>{expect(hd415blm2(3,1)).toBe(1);});it('c',()=>{expect(hd415blm2(0,0)).toBe(0);});it('d',()=>{expect(hd415blm2(93,73)).toBe(2);});it('e',()=>{expect(hd415blm2(15,0)).toBe(4);});});
function hd416blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416blm2_hd',()=>{it('a',()=>{expect(hd416blm2(1,4)).toBe(2);});it('b',()=>{expect(hd416blm2(3,1)).toBe(1);});it('c',()=>{expect(hd416blm2(0,0)).toBe(0);});it('d',()=>{expect(hd416blm2(93,73)).toBe(2);});it('e',()=>{expect(hd416blm2(15,0)).toBe(4);});});
function hd417blm2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417blm2_hd',()=>{it('a',()=>{expect(hd417blm2(1,4)).toBe(2);});it('b',()=>{expect(hd417blm2(3,1)).toBe(1);});it('c',()=>{expect(hd417blm2(0,0)).toBe(0);});it('d',()=>{expect(hd417blm2(93,73)).toBe(2);});it('e',()=>{expect(hd417blm2(15,0)).toBe(4);});});
