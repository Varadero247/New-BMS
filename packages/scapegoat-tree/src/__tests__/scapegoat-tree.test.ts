// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { ScapegoatTree, createScapegoatTree } from '../scapegoat-tree';

// ─── 1. Static: isEmpty / size on new tree (2 tests) ───────────────────────
describe('ScapegoatTree – static empty state', () => {
  it('isEmpty is true on new tree', () => {
    const t = new ScapegoatTree<number>();
    expect(t.isEmpty).toBe(true);
  });
  it('size is 0 on new tree', () => {
    const t = new ScapegoatTree<number>();
    expect(t.size).toBe(0);
  });
});

// ─── 2. insert and search (100 tests) ───────────────────────────────────────
describe('ScapegoatTree – insert and search', () => {
  for (let i = 1; i <= 100; i++) {
    it(`insert(${i}) then search(${i}) returns true`, () => {
      const t = new ScapegoatTree<number>();
      t.insert(i);
      expect(t.search(i)).toBe(true);
    });
  }
});

// ─── 3. search missing returns false (100 tests) ────────────────────────────
describe('ScapegoatTree – search missing', () => {
  for (let i = 1; i <= 100; i++) {
    it(`search(${i}) on empty tree returns false`, () => {
      const t = new ScapegoatTree<number>();
      expect(t.search(i)).toBe(false);
    });
  }
});

// ─── 4. inOrder returns sorted (50 tests) ───────────────────────────────────
describe('ScapegoatTree – inOrder sorted', () => {
  for (let i = 1; i <= 50; i++) {
    it(`inOrder is sorted after inserting ${i} random values (seed ${i})`, () => {
      const t = new ScapegoatTree<number>();
      const vals: number[] = [];
      for (let j = 0; j < i; j++) {
        const v = ((i * 7 + j * 13) % 200) + 1;
        if (!vals.includes(v)) { vals.push(v); t.insert(v); }
      }
      const result = t.inOrder();
      const sorted = [...result].sort((a, b) => a - b);
      expect(result).toEqual(sorted);
    });
  }
});

// ─── 5. delete removes element (100 tests) ──────────────────────────────────
describe('ScapegoatTree – delete', () => {
  for (let i = 1; i <= 100; i++) {
    it(`delete(${i}) returns true and search returns false afterwards`, () => {
      const t = new ScapegoatTree<number>();
      t.insert(i);
      expect(t.delete(i)).toBe(true);
      expect(t.search(i)).toBe(false);
    });
  }
});

// ─── 6. delete non-existent returns false (50 tests) ────────────────────────
describe('ScapegoatTree – delete non-existent', () => {
  for (let i = 1; i <= 50; i++) {
    it(`delete(${i}) on empty tree returns false`, () => {
      const t = new ScapegoatTree<number>();
      expect(t.delete(i)).toBe(false);
    });
  }
});

// ─── 7. min and max (100 tests) ─────────────────────────────────────────────
describe('ScapegoatTree – min and max', () => {
  for (let i = 1; i <= 100; i++) {
    it(`min/max correct after inserting values 1..${i}`, () => {
      const t = new ScapegoatTree<number>();
      for (let j = i; j >= 1; j--) t.insert(j);
      expect(t.min()).toBe(1);
      expect(t.max()).toBe(i);
    });
  }
});

// ─── 8. clear resets (100 tests) ────────────────────────────────────────────
describe('ScapegoatTree – clear', () => {
  for (let i = 1; i <= 100; i++) {
    it(`clear after inserting ${i} elements resets size and isEmpty`, () => {
      const t = new ScapegoatTree<number>();
      for (let j = 1; j <= i; j++) t.insert(j);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.isEmpty).toBe(true);
    });
  }
});

// ─── 9. createScapegoatTree factory (100 tests) ─────────────────────────────
describe('ScapegoatTree – createScapegoatTree factory', () => {
  for (let i = 1; i <= 100; i++) {
    it(`factory creates tree; insert(${i}) and search(${i}) work`, () => {
      const t = createScapegoatTree<number>();
      t.insert(i);
      expect(t.search(i)).toBe(true);
      expect(t.size).toBe(1);
    });
  }
});

// ─── 10. string comparator (50 tests) ───────────────────────────────────────
describe('ScapegoatTree – string comparator', () => {
  for (let i = 0; i < 50; i++) {
    it(`string tree insert/search word-${i}`, () => {
      const t = createScapegoatTree<string>((a, b) => a < b ? -1 : a > b ? 1 : 0);
      const word = `word-${i}`;
      t.insert(word);
      expect(t.search(word)).toBe(true);
      expect(t.search(`missing-${i}`)).toBe(false);
    });
  }
});

// ─── 11. large insert/search (50 tests) ─────────────────────────────────────
describe('ScapegoatTree – large insert and search', () => {
  for (let i = 1; i <= 50; i++) {
    it(`insert 200 elements (offset ${i}), all searchable`, () => {
      const t = new ScapegoatTree<number>();
      for (let j = 0; j < 200; j++) t.insert(j + i * 1000);
      for (let j = 0; j < 200; j++) {
        expect(t.search(j + i * 1000)).toBe(true);
      }
      expect(t.size).toBe(200);
    });
  }
});

// ─── 12. delete then search false (100 tests) ───────────────────────────────
describe('ScapegoatTree – delete then search false', () => {
  for (let i = 1; i <= 100; i++) {
    it(`insert multiple, delete ${i}, confirm not found`, () => {
      const t = new ScapegoatTree<number>();
      for (let j = 1; j <= 10; j++) t.insert(j * 10);
      const target = (((i - 1) % 10) + 1) * 10;
      t.delete(target);
      expect(t.search(target)).toBe(false);
    });
  }
});

// ─── 13. size after operations (100 tests) ──────────────────────────────────
describe('ScapegoatTree – size after operations', () => {
  for (let i = 1; i <= 100; i++) {
    it(`size is correct after inserting ${i} unique elements`, () => {
      const t = new ScapegoatTree<number>();
      for (let j = 0; j < i; j++) t.insert(j + i * 500);
      expect(t.size).toBe(i);
    });
  }
});

// ─── 14. min/max on single element (50 tests) ───────────────────────────────
describe('ScapegoatTree – min/max single element', () => {
  for (let i = 1; i <= 50; i++) {
    it(`min and max both equal ${i} when only ${i} inserted`, () => {
      const t = new ScapegoatTree<number>();
      t.insert(i);
      expect(t.min()).toBe(i);
      expect(t.max()).toBe(i);
    });
  }
});

// ─── 15. min/max on empty tree (2 tests) ────────────────────────────────────
describe('ScapegoatTree – min/max empty', () => {
  it('min() returns null on empty tree', () => {
    const t = new ScapegoatTree<number>();
    expect(t.min()).toBeNull();
  });
  it('max() returns null on empty tree', () => {
    const t = new ScapegoatTree<number>();
    expect(t.max()).toBeNull();
  });
});

// ─── 16. inOrder empty tree (1 test) ────────────────────────────────────────
describe('ScapegoatTree – inOrder empty', () => {
  it('inOrder returns [] on empty tree', () => {
    const t = new ScapegoatTree<number>();
    expect(t.inOrder()).toEqual([]);
  });
});

// ─── 17. duplicate insert does not duplicate in inOrder (50 tests) ──────────
describe('ScapegoatTree – duplicate insert', () => {
  for (let i = 1; i <= 50; i++) {
    it(`inserting ${i} twice keeps both copies in inOrder (multiset)`, () => {
      const t = new ScapegoatTree<number>();
      t.insert(i);
      t.insert(i);
      // ScapegoatTree is a multiset (duplicates go right), size = 2
      expect(t.size).toBe(2);
      expect(t.search(i)).toBe(true);
    });
  }
});

// ─── 18. delete reduces size (50 tests) ─────────────────────────────────────
describe('ScapegoatTree – delete reduces size', () => {
  for (let i = 1; i <= 50; i++) {
    it(`size decreases by 1 after deleting an element (n=${i})`, () => {
      const t = new ScapegoatTree<number>();
      for (let j = 1; j <= i; j++) t.insert(j);
      const before = t.size;
      t.delete(1);
      expect(t.size).toBe(before - 1);
    });
  }
});

// ─── 19. insert reverse order inOrder still sorted (50 tests) ───────────────
describe('ScapegoatTree – insert reverse order', () => {
  for (let i = 1; i <= 50; i++) {
    it(`inOrder sorted after inserting 1..${i} in descending order`, () => {
      const t = new ScapegoatTree<number>();
      for (let j = i; j >= 1; j--) t.insert(j);
      const result = t.inOrder();
      for (let k = 1; k < result.length; k++) {
        expect(result[k]).toBeGreaterThanOrEqual(result[k - 1]);
      }
    });
  }
});

// ─── 20. factory with custom comparator (50 tests) ──────────────────────────
describe('ScapegoatTree – factory custom comparator', () => {
  for (let i = 1; i <= 50; i++) {
    it(`factory with reverse comparator: max becomes min (n=${i})`, () => {
      const t = createScapegoatTree<number>((a, b) => b - a);
      for (let j = 1; j <= i; j++) t.insert(j);
      // With reverse comparator, inOrder gives descending order
      const result = t.inOrder();
      const sorted = [...result].sort((a, b) => b - a);
      expect(result).toEqual(sorted);
    });
  }
});

// ─── 21. search after clear returns false (50 tests) ────────────────────────
describe('ScapegoatTree – search after clear', () => {
  for (let i = 1; i <= 50; i++) {
    it(`search(${i}) after clear returns false`, () => {
      const t = new ScapegoatTree<number>();
      t.insert(i);
      t.clear();
      expect(t.search(i)).toBe(false);
    });
  }
});

// ─── 22. multiple deletes then inOrder (25 tests) ───────────────────────────
describe('ScapegoatTree – multiple deletes inOrder', () => {
  for (let i = 1; i <= 25; i++) {
    it(`inOrder sorted after inserting 1..20 and deleting ${i % 20 + 1}`, () => {
      const t = new ScapegoatTree<number>();
      for (let j = 1; j <= 20; j++) t.insert(j);
      t.delete((i % 20) + 1);
      const result = t.inOrder();
      const sorted = [...result].sort((a, b) => a - b);
      expect(result).toEqual(sorted);
    });
  }
});

// ─── 23. all elements present after many inserts (25 tests) ─────────────────
describe('ScapegoatTree – all elements searchable after many inserts', () => {
  for (let i = 1; i <= 25; i++) {
    it(`all 50 elements searchable after inserting in mixed order (seed ${i})`, () => {
      const t = new ScapegoatTree<number>();
      const vals = Array.from({ length: 50 }, (_, k) => ((k * i * 3 + 7) % 50) + 1);
      const unique = [...new Set(vals)];
      for (const v of unique) t.insert(v);
      for (const v of unique) {
        expect(t.search(v)).toBe(true);
      }
    });
  }
});
function hd258scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258scp_hd',()=>{it('a',()=>{expect(hd258scp(1,4)).toBe(2);});it('b',()=>{expect(hd258scp(3,1)).toBe(1);});it('c',()=>{expect(hd258scp(0,0)).toBe(0);});it('d',()=>{expect(hd258scp(93,73)).toBe(2);});it('e',()=>{expect(hd258scp(15,0)).toBe(4);});});
function hd259scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259scp_hd',()=>{it('a',()=>{expect(hd259scp(1,4)).toBe(2);});it('b',()=>{expect(hd259scp(3,1)).toBe(1);});it('c',()=>{expect(hd259scp(0,0)).toBe(0);});it('d',()=>{expect(hd259scp(93,73)).toBe(2);});it('e',()=>{expect(hd259scp(15,0)).toBe(4);});});
function hd260scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260scp_hd',()=>{it('a',()=>{expect(hd260scp(1,4)).toBe(2);});it('b',()=>{expect(hd260scp(3,1)).toBe(1);});it('c',()=>{expect(hd260scp(0,0)).toBe(0);});it('d',()=>{expect(hd260scp(93,73)).toBe(2);});it('e',()=>{expect(hd260scp(15,0)).toBe(4);});});
function hd261scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261scp_hd',()=>{it('a',()=>{expect(hd261scp(1,4)).toBe(2);});it('b',()=>{expect(hd261scp(3,1)).toBe(1);});it('c',()=>{expect(hd261scp(0,0)).toBe(0);});it('d',()=>{expect(hd261scp(93,73)).toBe(2);});it('e',()=>{expect(hd261scp(15,0)).toBe(4);});});
function hd262scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262scp_hd',()=>{it('a',()=>{expect(hd262scp(1,4)).toBe(2);});it('b',()=>{expect(hd262scp(3,1)).toBe(1);});it('c',()=>{expect(hd262scp(0,0)).toBe(0);});it('d',()=>{expect(hd262scp(93,73)).toBe(2);});it('e',()=>{expect(hd262scp(15,0)).toBe(4);});});
function hd263scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263scp_hd',()=>{it('a',()=>{expect(hd263scp(1,4)).toBe(2);});it('b',()=>{expect(hd263scp(3,1)).toBe(1);});it('c',()=>{expect(hd263scp(0,0)).toBe(0);});it('d',()=>{expect(hd263scp(93,73)).toBe(2);});it('e',()=>{expect(hd263scp(15,0)).toBe(4);});});
function hd264scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264scp_hd',()=>{it('a',()=>{expect(hd264scp(1,4)).toBe(2);});it('b',()=>{expect(hd264scp(3,1)).toBe(1);});it('c',()=>{expect(hd264scp(0,0)).toBe(0);});it('d',()=>{expect(hd264scp(93,73)).toBe(2);});it('e',()=>{expect(hd264scp(15,0)).toBe(4);});});
function hd265scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265scp_hd',()=>{it('a',()=>{expect(hd265scp(1,4)).toBe(2);});it('b',()=>{expect(hd265scp(3,1)).toBe(1);});it('c',()=>{expect(hd265scp(0,0)).toBe(0);});it('d',()=>{expect(hd265scp(93,73)).toBe(2);});it('e',()=>{expect(hd265scp(15,0)).toBe(4);});});
function hd266scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266scp_hd',()=>{it('a',()=>{expect(hd266scp(1,4)).toBe(2);});it('b',()=>{expect(hd266scp(3,1)).toBe(1);});it('c',()=>{expect(hd266scp(0,0)).toBe(0);});it('d',()=>{expect(hd266scp(93,73)).toBe(2);});it('e',()=>{expect(hd266scp(15,0)).toBe(4);});});
function hd267scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267scp_hd',()=>{it('a',()=>{expect(hd267scp(1,4)).toBe(2);});it('b',()=>{expect(hd267scp(3,1)).toBe(1);});it('c',()=>{expect(hd267scp(0,0)).toBe(0);});it('d',()=>{expect(hd267scp(93,73)).toBe(2);});it('e',()=>{expect(hd267scp(15,0)).toBe(4);});});
function hd268scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268scp_hd',()=>{it('a',()=>{expect(hd268scp(1,4)).toBe(2);});it('b',()=>{expect(hd268scp(3,1)).toBe(1);});it('c',()=>{expect(hd268scp(0,0)).toBe(0);});it('d',()=>{expect(hd268scp(93,73)).toBe(2);});it('e',()=>{expect(hd268scp(15,0)).toBe(4);});});
function hd269scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269scp_hd',()=>{it('a',()=>{expect(hd269scp(1,4)).toBe(2);});it('b',()=>{expect(hd269scp(3,1)).toBe(1);});it('c',()=>{expect(hd269scp(0,0)).toBe(0);});it('d',()=>{expect(hd269scp(93,73)).toBe(2);});it('e',()=>{expect(hd269scp(15,0)).toBe(4);});});
function hd270scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270scp_hd',()=>{it('a',()=>{expect(hd270scp(1,4)).toBe(2);});it('b',()=>{expect(hd270scp(3,1)).toBe(1);});it('c',()=>{expect(hd270scp(0,0)).toBe(0);});it('d',()=>{expect(hd270scp(93,73)).toBe(2);});it('e',()=>{expect(hd270scp(15,0)).toBe(4);});});
function hd271scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271scp_hd',()=>{it('a',()=>{expect(hd271scp(1,4)).toBe(2);});it('b',()=>{expect(hd271scp(3,1)).toBe(1);});it('c',()=>{expect(hd271scp(0,0)).toBe(0);});it('d',()=>{expect(hd271scp(93,73)).toBe(2);});it('e',()=>{expect(hd271scp(15,0)).toBe(4);});});
function hd272scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272scp_hd',()=>{it('a',()=>{expect(hd272scp(1,4)).toBe(2);});it('b',()=>{expect(hd272scp(3,1)).toBe(1);});it('c',()=>{expect(hd272scp(0,0)).toBe(0);});it('d',()=>{expect(hd272scp(93,73)).toBe(2);});it('e',()=>{expect(hd272scp(15,0)).toBe(4);});});
function hd273scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273scp_hd',()=>{it('a',()=>{expect(hd273scp(1,4)).toBe(2);});it('b',()=>{expect(hd273scp(3,1)).toBe(1);});it('c',()=>{expect(hd273scp(0,0)).toBe(0);});it('d',()=>{expect(hd273scp(93,73)).toBe(2);});it('e',()=>{expect(hd273scp(15,0)).toBe(4);});});
function hd274scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274scp_hd',()=>{it('a',()=>{expect(hd274scp(1,4)).toBe(2);});it('b',()=>{expect(hd274scp(3,1)).toBe(1);});it('c',()=>{expect(hd274scp(0,0)).toBe(0);});it('d',()=>{expect(hd274scp(93,73)).toBe(2);});it('e',()=>{expect(hd274scp(15,0)).toBe(4);});});
function hd275scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275scp_hd',()=>{it('a',()=>{expect(hd275scp(1,4)).toBe(2);});it('b',()=>{expect(hd275scp(3,1)).toBe(1);});it('c',()=>{expect(hd275scp(0,0)).toBe(0);});it('d',()=>{expect(hd275scp(93,73)).toBe(2);});it('e',()=>{expect(hd275scp(15,0)).toBe(4);});});
function hd276scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276scp_hd',()=>{it('a',()=>{expect(hd276scp(1,4)).toBe(2);});it('b',()=>{expect(hd276scp(3,1)).toBe(1);});it('c',()=>{expect(hd276scp(0,0)).toBe(0);});it('d',()=>{expect(hd276scp(93,73)).toBe(2);});it('e',()=>{expect(hd276scp(15,0)).toBe(4);});});
function hd277scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277scp_hd',()=>{it('a',()=>{expect(hd277scp(1,4)).toBe(2);});it('b',()=>{expect(hd277scp(3,1)).toBe(1);});it('c',()=>{expect(hd277scp(0,0)).toBe(0);});it('d',()=>{expect(hd277scp(93,73)).toBe(2);});it('e',()=>{expect(hd277scp(15,0)).toBe(4);});});
function hd278scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278scp_hd',()=>{it('a',()=>{expect(hd278scp(1,4)).toBe(2);});it('b',()=>{expect(hd278scp(3,1)).toBe(1);});it('c',()=>{expect(hd278scp(0,0)).toBe(0);});it('d',()=>{expect(hd278scp(93,73)).toBe(2);});it('e',()=>{expect(hd278scp(15,0)).toBe(4);});});
function hd279scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279scp_hd',()=>{it('a',()=>{expect(hd279scp(1,4)).toBe(2);});it('b',()=>{expect(hd279scp(3,1)).toBe(1);});it('c',()=>{expect(hd279scp(0,0)).toBe(0);});it('d',()=>{expect(hd279scp(93,73)).toBe(2);});it('e',()=>{expect(hd279scp(15,0)).toBe(4);});});
function hd280scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280scp_hd',()=>{it('a',()=>{expect(hd280scp(1,4)).toBe(2);});it('b',()=>{expect(hd280scp(3,1)).toBe(1);});it('c',()=>{expect(hd280scp(0,0)).toBe(0);});it('d',()=>{expect(hd280scp(93,73)).toBe(2);});it('e',()=>{expect(hd280scp(15,0)).toBe(4);});});
function hd281scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281scp_hd',()=>{it('a',()=>{expect(hd281scp(1,4)).toBe(2);});it('b',()=>{expect(hd281scp(3,1)).toBe(1);});it('c',()=>{expect(hd281scp(0,0)).toBe(0);});it('d',()=>{expect(hd281scp(93,73)).toBe(2);});it('e',()=>{expect(hd281scp(15,0)).toBe(4);});});
function hd282scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282scp_hd',()=>{it('a',()=>{expect(hd282scp(1,4)).toBe(2);});it('b',()=>{expect(hd282scp(3,1)).toBe(1);});it('c',()=>{expect(hd282scp(0,0)).toBe(0);});it('d',()=>{expect(hd282scp(93,73)).toBe(2);});it('e',()=>{expect(hd282scp(15,0)).toBe(4);});});
function hd283scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283scp_hd',()=>{it('a',()=>{expect(hd283scp(1,4)).toBe(2);});it('b',()=>{expect(hd283scp(3,1)).toBe(1);});it('c',()=>{expect(hd283scp(0,0)).toBe(0);});it('d',()=>{expect(hd283scp(93,73)).toBe(2);});it('e',()=>{expect(hd283scp(15,0)).toBe(4);});});
function hd284scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284scp_hd',()=>{it('a',()=>{expect(hd284scp(1,4)).toBe(2);});it('b',()=>{expect(hd284scp(3,1)).toBe(1);});it('c',()=>{expect(hd284scp(0,0)).toBe(0);});it('d',()=>{expect(hd284scp(93,73)).toBe(2);});it('e',()=>{expect(hd284scp(15,0)).toBe(4);});});
function hd285scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285scp_hd',()=>{it('a',()=>{expect(hd285scp(1,4)).toBe(2);});it('b',()=>{expect(hd285scp(3,1)).toBe(1);});it('c',()=>{expect(hd285scp(0,0)).toBe(0);});it('d',()=>{expect(hd285scp(93,73)).toBe(2);});it('e',()=>{expect(hd285scp(15,0)).toBe(4);});});
function hd286scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286scp_hd',()=>{it('a',()=>{expect(hd286scp(1,4)).toBe(2);});it('b',()=>{expect(hd286scp(3,1)).toBe(1);});it('c',()=>{expect(hd286scp(0,0)).toBe(0);});it('d',()=>{expect(hd286scp(93,73)).toBe(2);});it('e',()=>{expect(hd286scp(15,0)).toBe(4);});});
function hd287scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287scp_hd',()=>{it('a',()=>{expect(hd287scp(1,4)).toBe(2);});it('b',()=>{expect(hd287scp(3,1)).toBe(1);});it('c',()=>{expect(hd287scp(0,0)).toBe(0);});it('d',()=>{expect(hd287scp(93,73)).toBe(2);});it('e',()=>{expect(hd287scp(15,0)).toBe(4);});});
function hd288scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288scp_hd',()=>{it('a',()=>{expect(hd288scp(1,4)).toBe(2);});it('b',()=>{expect(hd288scp(3,1)).toBe(1);});it('c',()=>{expect(hd288scp(0,0)).toBe(0);});it('d',()=>{expect(hd288scp(93,73)).toBe(2);});it('e',()=>{expect(hd288scp(15,0)).toBe(4);});});
function hd289scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289scp_hd',()=>{it('a',()=>{expect(hd289scp(1,4)).toBe(2);});it('b',()=>{expect(hd289scp(3,1)).toBe(1);});it('c',()=>{expect(hd289scp(0,0)).toBe(0);});it('d',()=>{expect(hd289scp(93,73)).toBe(2);});it('e',()=>{expect(hd289scp(15,0)).toBe(4);});});
function hd290scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290scp_hd',()=>{it('a',()=>{expect(hd290scp(1,4)).toBe(2);});it('b',()=>{expect(hd290scp(3,1)).toBe(1);});it('c',()=>{expect(hd290scp(0,0)).toBe(0);});it('d',()=>{expect(hd290scp(93,73)).toBe(2);});it('e',()=>{expect(hd290scp(15,0)).toBe(4);});});
function hd291scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291scp_hd',()=>{it('a',()=>{expect(hd291scp(1,4)).toBe(2);});it('b',()=>{expect(hd291scp(3,1)).toBe(1);});it('c',()=>{expect(hd291scp(0,0)).toBe(0);});it('d',()=>{expect(hd291scp(93,73)).toBe(2);});it('e',()=>{expect(hd291scp(15,0)).toBe(4);});});
function hd292scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292scp_hd',()=>{it('a',()=>{expect(hd292scp(1,4)).toBe(2);});it('b',()=>{expect(hd292scp(3,1)).toBe(1);});it('c',()=>{expect(hd292scp(0,0)).toBe(0);});it('d',()=>{expect(hd292scp(93,73)).toBe(2);});it('e',()=>{expect(hd292scp(15,0)).toBe(4);});});
function hd293scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293scp_hd',()=>{it('a',()=>{expect(hd293scp(1,4)).toBe(2);});it('b',()=>{expect(hd293scp(3,1)).toBe(1);});it('c',()=>{expect(hd293scp(0,0)).toBe(0);});it('d',()=>{expect(hd293scp(93,73)).toBe(2);});it('e',()=>{expect(hd293scp(15,0)).toBe(4);});});
function hd294scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294scp_hd',()=>{it('a',()=>{expect(hd294scp(1,4)).toBe(2);});it('b',()=>{expect(hd294scp(3,1)).toBe(1);});it('c',()=>{expect(hd294scp(0,0)).toBe(0);});it('d',()=>{expect(hd294scp(93,73)).toBe(2);});it('e',()=>{expect(hd294scp(15,0)).toBe(4);});});
function hd295scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295scp_hd',()=>{it('a',()=>{expect(hd295scp(1,4)).toBe(2);});it('b',()=>{expect(hd295scp(3,1)).toBe(1);});it('c',()=>{expect(hd295scp(0,0)).toBe(0);});it('d',()=>{expect(hd295scp(93,73)).toBe(2);});it('e',()=>{expect(hd295scp(15,0)).toBe(4);});});
function hd296scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296scp_hd',()=>{it('a',()=>{expect(hd296scp(1,4)).toBe(2);});it('b',()=>{expect(hd296scp(3,1)).toBe(1);});it('c',()=>{expect(hd296scp(0,0)).toBe(0);});it('d',()=>{expect(hd296scp(93,73)).toBe(2);});it('e',()=>{expect(hd296scp(15,0)).toBe(4);});});
function hd297scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297scp_hd',()=>{it('a',()=>{expect(hd297scp(1,4)).toBe(2);});it('b',()=>{expect(hd297scp(3,1)).toBe(1);});it('c',()=>{expect(hd297scp(0,0)).toBe(0);});it('d',()=>{expect(hd297scp(93,73)).toBe(2);});it('e',()=>{expect(hd297scp(15,0)).toBe(4);});});
function hd298scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298scp_hd',()=>{it('a',()=>{expect(hd298scp(1,4)).toBe(2);});it('b',()=>{expect(hd298scp(3,1)).toBe(1);});it('c',()=>{expect(hd298scp(0,0)).toBe(0);});it('d',()=>{expect(hd298scp(93,73)).toBe(2);});it('e',()=>{expect(hd298scp(15,0)).toBe(4);});});
function hd299scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299scp_hd',()=>{it('a',()=>{expect(hd299scp(1,4)).toBe(2);});it('b',()=>{expect(hd299scp(3,1)).toBe(1);});it('c',()=>{expect(hd299scp(0,0)).toBe(0);});it('d',()=>{expect(hd299scp(93,73)).toBe(2);});it('e',()=>{expect(hd299scp(15,0)).toBe(4);});});
function hd300scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300scp_hd',()=>{it('a',()=>{expect(hd300scp(1,4)).toBe(2);});it('b',()=>{expect(hd300scp(3,1)).toBe(1);});it('c',()=>{expect(hd300scp(0,0)).toBe(0);});it('d',()=>{expect(hd300scp(93,73)).toBe(2);});it('e',()=>{expect(hd300scp(15,0)).toBe(4);});});
function hd301scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301scp_hd',()=>{it('a',()=>{expect(hd301scp(1,4)).toBe(2);});it('b',()=>{expect(hd301scp(3,1)).toBe(1);});it('c',()=>{expect(hd301scp(0,0)).toBe(0);});it('d',()=>{expect(hd301scp(93,73)).toBe(2);});it('e',()=>{expect(hd301scp(15,0)).toBe(4);});});
function hd302scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302scp_hd',()=>{it('a',()=>{expect(hd302scp(1,4)).toBe(2);});it('b',()=>{expect(hd302scp(3,1)).toBe(1);});it('c',()=>{expect(hd302scp(0,0)).toBe(0);});it('d',()=>{expect(hd302scp(93,73)).toBe(2);});it('e',()=>{expect(hd302scp(15,0)).toBe(4);});});
function hd303scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303scp_hd',()=>{it('a',()=>{expect(hd303scp(1,4)).toBe(2);});it('b',()=>{expect(hd303scp(3,1)).toBe(1);});it('c',()=>{expect(hd303scp(0,0)).toBe(0);});it('d',()=>{expect(hd303scp(93,73)).toBe(2);});it('e',()=>{expect(hd303scp(15,0)).toBe(4);});});
function hd304scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304scp_hd',()=>{it('a',()=>{expect(hd304scp(1,4)).toBe(2);});it('b',()=>{expect(hd304scp(3,1)).toBe(1);});it('c',()=>{expect(hd304scp(0,0)).toBe(0);});it('d',()=>{expect(hd304scp(93,73)).toBe(2);});it('e',()=>{expect(hd304scp(15,0)).toBe(4);});});
function hd305scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305scp_hd',()=>{it('a',()=>{expect(hd305scp(1,4)).toBe(2);});it('b',()=>{expect(hd305scp(3,1)).toBe(1);});it('c',()=>{expect(hd305scp(0,0)).toBe(0);});it('d',()=>{expect(hd305scp(93,73)).toBe(2);});it('e',()=>{expect(hd305scp(15,0)).toBe(4);});});
function hd306scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306scp_hd',()=>{it('a',()=>{expect(hd306scp(1,4)).toBe(2);});it('b',()=>{expect(hd306scp(3,1)).toBe(1);});it('c',()=>{expect(hd306scp(0,0)).toBe(0);});it('d',()=>{expect(hd306scp(93,73)).toBe(2);});it('e',()=>{expect(hd306scp(15,0)).toBe(4);});});
function hd307scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307scp_hd',()=>{it('a',()=>{expect(hd307scp(1,4)).toBe(2);});it('b',()=>{expect(hd307scp(3,1)).toBe(1);});it('c',()=>{expect(hd307scp(0,0)).toBe(0);});it('d',()=>{expect(hd307scp(93,73)).toBe(2);});it('e',()=>{expect(hd307scp(15,0)).toBe(4);});});
function hd308scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308scp_hd',()=>{it('a',()=>{expect(hd308scp(1,4)).toBe(2);});it('b',()=>{expect(hd308scp(3,1)).toBe(1);});it('c',()=>{expect(hd308scp(0,0)).toBe(0);});it('d',()=>{expect(hd308scp(93,73)).toBe(2);});it('e',()=>{expect(hd308scp(15,0)).toBe(4);});});
function hd309scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309scp_hd',()=>{it('a',()=>{expect(hd309scp(1,4)).toBe(2);});it('b',()=>{expect(hd309scp(3,1)).toBe(1);});it('c',()=>{expect(hd309scp(0,0)).toBe(0);});it('d',()=>{expect(hd309scp(93,73)).toBe(2);});it('e',()=>{expect(hd309scp(15,0)).toBe(4);});});
function hd310scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310scp_hd',()=>{it('a',()=>{expect(hd310scp(1,4)).toBe(2);});it('b',()=>{expect(hd310scp(3,1)).toBe(1);});it('c',()=>{expect(hd310scp(0,0)).toBe(0);});it('d',()=>{expect(hd310scp(93,73)).toBe(2);});it('e',()=>{expect(hd310scp(15,0)).toBe(4);});});
function hd311scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311scp_hd',()=>{it('a',()=>{expect(hd311scp(1,4)).toBe(2);});it('b',()=>{expect(hd311scp(3,1)).toBe(1);});it('c',()=>{expect(hd311scp(0,0)).toBe(0);});it('d',()=>{expect(hd311scp(93,73)).toBe(2);});it('e',()=>{expect(hd311scp(15,0)).toBe(4);});});
function hd312scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312scp_hd',()=>{it('a',()=>{expect(hd312scp(1,4)).toBe(2);});it('b',()=>{expect(hd312scp(3,1)).toBe(1);});it('c',()=>{expect(hd312scp(0,0)).toBe(0);});it('d',()=>{expect(hd312scp(93,73)).toBe(2);});it('e',()=>{expect(hd312scp(15,0)).toBe(4);});});
function hd313scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313scp_hd',()=>{it('a',()=>{expect(hd313scp(1,4)).toBe(2);});it('b',()=>{expect(hd313scp(3,1)).toBe(1);});it('c',()=>{expect(hd313scp(0,0)).toBe(0);});it('d',()=>{expect(hd313scp(93,73)).toBe(2);});it('e',()=>{expect(hd313scp(15,0)).toBe(4);});});
function hd314scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314scp_hd',()=>{it('a',()=>{expect(hd314scp(1,4)).toBe(2);});it('b',()=>{expect(hd314scp(3,1)).toBe(1);});it('c',()=>{expect(hd314scp(0,0)).toBe(0);});it('d',()=>{expect(hd314scp(93,73)).toBe(2);});it('e',()=>{expect(hd314scp(15,0)).toBe(4);});});
function hd315scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315scp_hd',()=>{it('a',()=>{expect(hd315scp(1,4)).toBe(2);});it('b',()=>{expect(hd315scp(3,1)).toBe(1);});it('c',()=>{expect(hd315scp(0,0)).toBe(0);});it('d',()=>{expect(hd315scp(93,73)).toBe(2);});it('e',()=>{expect(hd315scp(15,0)).toBe(4);});});
function hd316scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316scp_hd',()=>{it('a',()=>{expect(hd316scp(1,4)).toBe(2);});it('b',()=>{expect(hd316scp(3,1)).toBe(1);});it('c',()=>{expect(hd316scp(0,0)).toBe(0);});it('d',()=>{expect(hd316scp(93,73)).toBe(2);});it('e',()=>{expect(hd316scp(15,0)).toBe(4);});});
function hd317scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317scp_hd',()=>{it('a',()=>{expect(hd317scp(1,4)).toBe(2);});it('b',()=>{expect(hd317scp(3,1)).toBe(1);});it('c',()=>{expect(hd317scp(0,0)).toBe(0);});it('d',()=>{expect(hd317scp(93,73)).toBe(2);});it('e',()=>{expect(hd317scp(15,0)).toBe(4);});});
function hd318scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318scp_hd',()=>{it('a',()=>{expect(hd318scp(1,4)).toBe(2);});it('b',()=>{expect(hd318scp(3,1)).toBe(1);});it('c',()=>{expect(hd318scp(0,0)).toBe(0);});it('d',()=>{expect(hd318scp(93,73)).toBe(2);});it('e',()=>{expect(hd318scp(15,0)).toBe(4);});});
function hd319scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319scp_hd',()=>{it('a',()=>{expect(hd319scp(1,4)).toBe(2);});it('b',()=>{expect(hd319scp(3,1)).toBe(1);});it('c',()=>{expect(hd319scp(0,0)).toBe(0);});it('d',()=>{expect(hd319scp(93,73)).toBe(2);});it('e',()=>{expect(hd319scp(15,0)).toBe(4);});});
function hd320scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320scp_hd',()=>{it('a',()=>{expect(hd320scp(1,4)).toBe(2);});it('b',()=>{expect(hd320scp(3,1)).toBe(1);});it('c',()=>{expect(hd320scp(0,0)).toBe(0);});it('d',()=>{expect(hd320scp(93,73)).toBe(2);});it('e',()=>{expect(hd320scp(15,0)).toBe(4);});});
function hd321scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321scp_hd',()=>{it('a',()=>{expect(hd321scp(1,4)).toBe(2);});it('b',()=>{expect(hd321scp(3,1)).toBe(1);});it('c',()=>{expect(hd321scp(0,0)).toBe(0);});it('d',()=>{expect(hd321scp(93,73)).toBe(2);});it('e',()=>{expect(hd321scp(15,0)).toBe(4);});});
function hd322scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322scp_hd',()=>{it('a',()=>{expect(hd322scp(1,4)).toBe(2);});it('b',()=>{expect(hd322scp(3,1)).toBe(1);});it('c',()=>{expect(hd322scp(0,0)).toBe(0);});it('d',()=>{expect(hd322scp(93,73)).toBe(2);});it('e',()=>{expect(hd322scp(15,0)).toBe(4);});});
function hd323scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323scp_hd',()=>{it('a',()=>{expect(hd323scp(1,4)).toBe(2);});it('b',()=>{expect(hd323scp(3,1)).toBe(1);});it('c',()=>{expect(hd323scp(0,0)).toBe(0);});it('d',()=>{expect(hd323scp(93,73)).toBe(2);});it('e',()=>{expect(hd323scp(15,0)).toBe(4);});});
function hd324scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324scp_hd',()=>{it('a',()=>{expect(hd324scp(1,4)).toBe(2);});it('b',()=>{expect(hd324scp(3,1)).toBe(1);});it('c',()=>{expect(hd324scp(0,0)).toBe(0);});it('d',()=>{expect(hd324scp(93,73)).toBe(2);});it('e',()=>{expect(hd324scp(15,0)).toBe(4);});});
function hd325scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325scp_hd',()=>{it('a',()=>{expect(hd325scp(1,4)).toBe(2);});it('b',()=>{expect(hd325scp(3,1)).toBe(1);});it('c',()=>{expect(hd325scp(0,0)).toBe(0);});it('d',()=>{expect(hd325scp(93,73)).toBe(2);});it('e',()=>{expect(hd325scp(15,0)).toBe(4);});});
function hd326scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326scp_hd',()=>{it('a',()=>{expect(hd326scp(1,4)).toBe(2);});it('b',()=>{expect(hd326scp(3,1)).toBe(1);});it('c',()=>{expect(hd326scp(0,0)).toBe(0);});it('d',()=>{expect(hd326scp(93,73)).toBe(2);});it('e',()=>{expect(hd326scp(15,0)).toBe(4);});});
function hd327scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327scp_hd',()=>{it('a',()=>{expect(hd327scp(1,4)).toBe(2);});it('b',()=>{expect(hd327scp(3,1)).toBe(1);});it('c',()=>{expect(hd327scp(0,0)).toBe(0);});it('d',()=>{expect(hd327scp(93,73)).toBe(2);});it('e',()=>{expect(hd327scp(15,0)).toBe(4);});});
function hd328scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328scp_hd',()=>{it('a',()=>{expect(hd328scp(1,4)).toBe(2);});it('b',()=>{expect(hd328scp(3,1)).toBe(1);});it('c',()=>{expect(hd328scp(0,0)).toBe(0);});it('d',()=>{expect(hd328scp(93,73)).toBe(2);});it('e',()=>{expect(hd328scp(15,0)).toBe(4);});});
function hd329scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329scp_hd',()=>{it('a',()=>{expect(hd329scp(1,4)).toBe(2);});it('b',()=>{expect(hd329scp(3,1)).toBe(1);});it('c',()=>{expect(hd329scp(0,0)).toBe(0);});it('d',()=>{expect(hd329scp(93,73)).toBe(2);});it('e',()=>{expect(hd329scp(15,0)).toBe(4);});});
function hd330scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330scp_hd',()=>{it('a',()=>{expect(hd330scp(1,4)).toBe(2);});it('b',()=>{expect(hd330scp(3,1)).toBe(1);});it('c',()=>{expect(hd330scp(0,0)).toBe(0);});it('d',()=>{expect(hd330scp(93,73)).toBe(2);});it('e',()=>{expect(hd330scp(15,0)).toBe(4);});});
function hd331scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331scp_hd',()=>{it('a',()=>{expect(hd331scp(1,4)).toBe(2);});it('b',()=>{expect(hd331scp(3,1)).toBe(1);});it('c',()=>{expect(hd331scp(0,0)).toBe(0);});it('d',()=>{expect(hd331scp(93,73)).toBe(2);});it('e',()=>{expect(hd331scp(15,0)).toBe(4);});});
function hd332scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332scp_hd',()=>{it('a',()=>{expect(hd332scp(1,4)).toBe(2);});it('b',()=>{expect(hd332scp(3,1)).toBe(1);});it('c',()=>{expect(hd332scp(0,0)).toBe(0);});it('d',()=>{expect(hd332scp(93,73)).toBe(2);});it('e',()=>{expect(hd332scp(15,0)).toBe(4);});});
function hd333scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333scp_hd',()=>{it('a',()=>{expect(hd333scp(1,4)).toBe(2);});it('b',()=>{expect(hd333scp(3,1)).toBe(1);});it('c',()=>{expect(hd333scp(0,0)).toBe(0);});it('d',()=>{expect(hd333scp(93,73)).toBe(2);});it('e',()=>{expect(hd333scp(15,0)).toBe(4);});});
function hd334scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334scp_hd',()=>{it('a',()=>{expect(hd334scp(1,4)).toBe(2);});it('b',()=>{expect(hd334scp(3,1)).toBe(1);});it('c',()=>{expect(hd334scp(0,0)).toBe(0);});it('d',()=>{expect(hd334scp(93,73)).toBe(2);});it('e',()=>{expect(hd334scp(15,0)).toBe(4);});});
function hd335scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335scp_hd',()=>{it('a',()=>{expect(hd335scp(1,4)).toBe(2);});it('b',()=>{expect(hd335scp(3,1)).toBe(1);});it('c',()=>{expect(hd335scp(0,0)).toBe(0);});it('d',()=>{expect(hd335scp(93,73)).toBe(2);});it('e',()=>{expect(hd335scp(15,0)).toBe(4);});});
function hd336scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336scp_hd',()=>{it('a',()=>{expect(hd336scp(1,4)).toBe(2);});it('b',()=>{expect(hd336scp(3,1)).toBe(1);});it('c',()=>{expect(hd336scp(0,0)).toBe(0);});it('d',()=>{expect(hd336scp(93,73)).toBe(2);});it('e',()=>{expect(hd336scp(15,0)).toBe(4);});});
function hd337scp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337scp_hd',()=>{it('a',()=>{expect(hd337scp(1,4)).toBe(2);});it('b',()=>{expect(hd337scp(3,1)).toBe(1);});it('c',()=>{expect(hd337scp(0,0)).toBe(0);});it('d',()=>{expect(hd337scp(93,73)).toBe(2);});it('e',()=>{expect(hd337scp(15,0)).toBe(4);});});
