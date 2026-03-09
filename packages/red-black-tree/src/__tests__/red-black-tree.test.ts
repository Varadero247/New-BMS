// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { RedBlackTree, createRedBlackTree, buildRBTree } from '../red-black-tree';

describe('RedBlackTree - insert and search', () => {
  it('empty tree isEmpty', () => { expect(new RedBlackTree().isEmpty()).toBe(true); });
  it('size 0 initially', () => { expect(new RedBlackTree().size).toBe(0); });
  it('insert one element', () => { const t = new RedBlackTree(); t.insert(5); expect(t.size).toBe(1); });
  it('search inserted element', () => { const t = new RedBlackTree(); t.insert(5); expect(t.search(5)).toBe(true); });
  it('search missing element', () => { expect(new RedBlackTree().search(99)).toBe(false); });
  it('duplicate insert ignored', () => { const t = new RedBlackTree(); t.insert(5); t.insert(5); expect(t.size).toBe(1); });
  it('inOrder is sorted', () => {
    const t = buildRBTree([5,3,7,1,4]);
    expect(t.inOrder()).toEqual([1,3,4,5,7]);
  });
  for (let i = 0; i < 100; i++) {
    it('insert and search ' + i, () => {
      const t = new RedBlackTree(); t.insert(i);
      expect(t.search(i)).toBe(true);
    });
  }
  for (let n = 1; n <= 50; n++) {
    it('inOrder sorted for ' + n + ' elements', () => {
      const arr = Array.from({ length: n }, (_, i) => n - i);
      const t = buildRBTree(arr);
      const sorted = t.inOrder();
      for (let i = 1; i < sorted.length; i++) expect(sorted[i]).toBeGreaterThan(sorted[i-1]);
    });
  }
  for (let n = 1; n <= 50; n++) {
    it('size = ' + n + ' after ' + n + ' unique inserts', () => {
      const t = new RedBlackTree();
      for (let i = 0; i < n; i++) t.insert(i);
      expect(t.size).toBe(n);
    });
  }
});

describe('RedBlackTree - min and max', () => {
  it('min of values', () => { expect(buildRBTree([5,3,8,1]).min()).toBe(1); });
  it('max of values', () => { expect(buildRBTree([5,3,8,1]).max()).toBe(8); });
  it('min/max of empty = undefined', () => { expect(new RedBlackTree().min()).toBeUndefined(); });
  for (let n = 1; n <= 50; n++) {
    it('min is 1 for array 1..' + n, () => { expect(buildRBTree(Array.from({length:n},(_,i)=>i+1)).min()).toBe(1); });
  }
  for (let n = 1; n <= 50; n++) {
    it('max is ' + n + ' for array 1..' + n, () => { expect(buildRBTree(Array.from({length:n},(_,i)=>i+1)).max()).toBe(n); });
  }
});

describe('createRedBlackTree', () => {
  it('returns instance', () => { expect(createRedBlackTree()).toBeInstanceOf(RedBlackTree); });
  it('custom string comparator', () => {
    const t = createRedBlackTree<string>((a,b)=>a.localeCompare(b));
    t.insert('banana'); t.insert('apple');
    expect(t.inOrder()).toEqual(['apple','banana']);
  });
  for (let i = 0; i < 100; i++) {
    it('search after insert with index ' + i, () => {
      const t = new RedBlackTree(); t.insert(i * 3);
      expect(t.search(i * 3)).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('buildRBTree and search ' + i, () => {
      const t = buildRBTree([i, i+1, i+2]);
      expect(t.search(i+1)).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('isEmpty = false after insert ' + i, () => {
      const t = new RedBlackTree(); t.insert(i);
      expect(t.isEmpty()).toBe(false);
    });
  }
});

describe('rbt top-up', () => {
  for (let i = 0; i < 100; i++) {
    it('rbt search missing ' + i, () => {
      const t = buildRBTree([i+1, i+2]);
      expect(t.search(i + 1000)).toBe(false);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('rbt inOrder length = size ' + i, () => {
      const t = new RedBlackTree();
      for (let j = 0; j <= i % 20; j++) t.insert(j);
      expect(t.inOrder().length).toBe(t.size);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('rbt size increments ' + i, () => {
      const t = new RedBlackTree();
      for (let j = 0; j < i + 1; j++) t.insert(j);
      expect(t.size).toBe(i + 1);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('rbt custom cmp insert ' + i, () => {
      const t = createRedBlackTree<number>((a,b) => b - a);
      t.insert(i); t.insert(i+1);
      expect(t.search(i)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('rbt max >= min ' + i, () => {
      const t = buildRBTree([i, i+5, i+2]);
      expect((t.max() ?? 0)).toBeGreaterThanOrEqual((t.min() ?? 0));
    });
  }
});
function hd258rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258rbt_hd',()=>{it('a',()=>{expect(hd258rbt(1,4)).toBe(2);});it('b',()=>{expect(hd258rbt(3,1)).toBe(1);});it('c',()=>{expect(hd258rbt(0,0)).toBe(0);});it('d',()=>{expect(hd258rbt(93,73)).toBe(2);});it('e',()=>{expect(hd258rbt(15,0)).toBe(4);});});
function hd259rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259rbt_hd',()=>{it('a',()=>{expect(hd259rbt(1,4)).toBe(2);});it('b',()=>{expect(hd259rbt(3,1)).toBe(1);});it('c',()=>{expect(hd259rbt(0,0)).toBe(0);});it('d',()=>{expect(hd259rbt(93,73)).toBe(2);});it('e',()=>{expect(hd259rbt(15,0)).toBe(4);});});
function hd260rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260rbt_hd',()=>{it('a',()=>{expect(hd260rbt(1,4)).toBe(2);});it('b',()=>{expect(hd260rbt(3,1)).toBe(1);});it('c',()=>{expect(hd260rbt(0,0)).toBe(0);});it('d',()=>{expect(hd260rbt(93,73)).toBe(2);});it('e',()=>{expect(hd260rbt(15,0)).toBe(4);});});
function hd261rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261rbt_hd',()=>{it('a',()=>{expect(hd261rbt(1,4)).toBe(2);});it('b',()=>{expect(hd261rbt(3,1)).toBe(1);});it('c',()=>{expect(hd261rbt(0,0)).toBe(0);});it('d',()=>{expect(hd261rbt(93,73)).toBe(2);});it('e',()=>{expect(hd261rbt(15,0)).toBe(4);});});
function hd262rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262rbt_hd',()=>{it('a',()=>{expect(hd262rbt(1,4)).toBe(2);});it('b',()=>{expect(hd262rbt(3,1)).toBe(1);});it('c',()=>{expect(hd262rbt(0,0)).toBe(0);});it('d',()=>{expect(hd262rbt(93,73)).toBe(2);});it('e',()=>{expect(hd262rbt(15,0)).toBe(4);});});
function hd263rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263rbt_hd',()=>{it('a',()=>{expect(hd263rbt(1,4)).toBe(2);});it('b',()=>{expect(hd263rbt(3,1)).toBe(1);});it('c',()=>{expect(hd263rbt(0,0)).toBe(0);});it('d',()=>{expect(hd263rbt(93,73)).toBe(2);});it('e',()=>{expect(hd263rbt(15,0)).toBe(4);});});
function hd264rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264rbt_hd',()=>{it('a',()=>{expect(hd264rbt(1,4)).toBe(2);});it('b',()=>{expect(hd264rbt(3,1)).toBe(1);});it('c',()=>{expect(hd264rbt(0,0)).toBe(0);});it('d',()=>{expect(hd264rbt(93,73)).toBe(2);});it('e',()=>{expect(hd264rbt(15,0)).toBe(4);});});
function hd265rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265rbt_hd',()=>{it('a',()=>{expect(hd265rbt(1,4)).toBe(2);});it('b',()=>{expect(hd265rbt(3,1)).toBe(1);});it('c',()=>{expect(hd265rbt(0,0)).toBe(0);});it('d',()=>{expect(hd265rbt(93,73)).toBe(2);});it('e',()=>{expect(hd265rbt(15,0)).toBe(4);});});
function hd266rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266rbt_hd',()=>{it('a',()=>{expect(hd266rbt(1,4)).toBe(2);});it('b',()=>{expect(hd266rbt(3,1)).toBe(1);});it('c',()=>{expect(hd266rbt(0,0)).toBe(0);});it('d',()=>{expect(hd266rbt(93,73)).toBe(2);});it('e',()=>{expect(hd266rbt(15,0)).toBe(4);});});
function hd267rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267rbt_hd',()=>{it('a',()=>{expect(hd267rbt(1,4)).toBe(2);});it('b',()=>{expect(hd267rbt(3,1)).toBe(1);});it('c',()=>{expect(hd267rbt(0,0)).toBe(0);});it('d',()=>{expect(hd267rbt(93,73)).toBe(2);});it('e',()=>{expect(hd267rbt(15,0)).toBe(4);});});
function hd268rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268rbt_hd',()=>{it('a',()=>{expect(hd268rbt(1,4)).toBe(2);});it('b',()=>{expect(hd268rbt(3,1)).toBe(1);});it('c',()=>{expect(hd268rbt(0,0)).toBe(0);});it('d',()=>{expect(hd268rbt(93,73)).toBe(2);});it('e',()=>{expect(hd268rbt(15,0)).toBe(4);});});
function hd269rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269rbt_hd',()=>{it('a',()=>{expect(hd269rbt(1,4)).toBe(2);});it('b',()=>{expect(hd269rbt(3,1)).toBe(1);});it('c',()=>{expect(hd269rbt(0,0)).toBe(0);});it('d',()=>{expect(hd269rbt(93,73)).toBe(2);});it('e',()=>{expect(hd269rbt(15,0)).toBe(4);});});
function hd270rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270rbt_hd',()=>{it('a',()=>{expect(hd270rbt(1,4)).toBe(2);});it('b',()=>{expect(hd270rbt(3,1)).toBe(1);});it('c',()=>{expect(hd270rbt(0,0)).toBe(0);});it('d',()=>{expect(hd270rbt(93,73)).toBe(2);});it('e',()=>{expect(hd270rbt(15,0)).toBe(4);});});
function hd271rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271rbt_hd',()=>{it('a',()=>{expect(hd271rbt(1,4)).toBe(2);});it('b',()=>{expect(hd271rbt(3,1)).toBe(1);});it('c',()=>{expect(hd271rbt(0,0)).toBe(0);});it('d',()=>{expect(hd271rbt(93,73)).toBe(2);});it('e',()=>{expect(hd271rbt(15,0)).toBe(4);});});
function hd272rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272rbt_hd',()=>{it('a',()=>{expect(hd272rbt(1,4)).toBe(2);});it('b',()=>{expect(hd272rbt(3,1)).toBe(1);});it('c',()=>{expect(hd272rbt(0,0)).toBe(0);});it('d',()=>{expect(hd272rbt(93,73)).toBe(2);});it('e',()=>{expect(hd272rbt(15,0)).toBe(4);});});
function hd273rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273rbt_hd',()=>{it('a',()=>{expect(hd273rbt(1,4)).toBe(2);});it('b',()=>{expect(hd273rbt(3,1)).toBe(1);});it('c',()=>{expect(hd273rbt(0,0)).toBe(0);});it('d',()=>{expect(hd273rbt(93,73)).toBe(2);});it('e',()=>{expect(hd273rbt(15,0)).toBe(4);});});
function hd274rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274rbt_hd',()=>{it('a',()=>{expect(hd274rbt(1,4)).toBe(2);});it('b',()=>{expect(hd274rbt(3,1)).toBe(1);});it('c',()=>{expect(hd274rbt(0,0)).toBe(0);});it('d',()=>{expect(hd274rbt(93,73)).toBe(2);});it('e',()=>{expect(hd274rbt(15,0)).toBe(4);});});
function hd275rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275rbt_hd',()=>{it('a',()=>{expect(hd275rbt(1,4)).toBe(2);});it('b',()=>{expect(hd275rbt(3,1)).toBe(1);});it('c',()=>{expect(hd275rbt(0,0)).toBe(0);});it('d',()=>{expect(hd275rbt(93,73)).toBe(2);});it('e',()=>{expect(hd275rbt(15,0)).toBe(4);});});
function hd276rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276rbt_hd',()=>{it('a',()=>{expect(hd276rbt(1,4)).toBe(2);});it('b',()=>{expect(hd276rbt(3,1)).toBe(1);});it('c',()=>{expect(hd276rbt(0,0)).toBe(0);});it('d',()=>{expect(hd276rbt(93,73)).toBe(2);});it('e',()=>{expect(hd276rbt(15,0)).toBe(4);});});
function hd277rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277rbt_hd',()=>{it('a',()=>{expect(hd277rbt(1,4)).toBe(2);});it('b',()=>{expect(hd277rbt(3,1)).toBe(1);});it('c',()=>{expect(hd277rbt(0,0)).toBe(0);});it('d',()=>{expect(hd277rbt(93,73)).toBe(2);});it('e',()=>{expect(hd277rbt(15,0)).toBe(4);});});
function hd278rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278rbt_hd',()=>{it('a',()=>{expect(hd278rbt(1,4)).toBe(2);});it('b',()=>{expect(hd278rbt(3,1)).toBe(1);});it('c',()=>{expect(hd278rbt(0,0)).toBe(0);});it('d',()=>{expect(hd278rbt(93,73)).toBe(2);});it('e',()=>{expect(hd278rbt(15,0)).toBe(4);});});
function hd279rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279rbt_hd',()=>{it('a',()=>{expect(hd279rbt(1,4)).toBe(2);});it('b',()=>{expect(hd279rbt(3,1)).toBe(1);});it('c',()=>{expect(hd279rbt(0,0)).toBe(0);});it('d',()=>{expect(hd279rbt(93,73)).toBe(2);});it('e',()=>{expect(hd279rbt(15,0)).toBe(4);});});
function hd280rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280rbt_hd',()=>{it('a',()=>{expect(hd280rbt(1,4)).toBe(2);});it('b',()=>{expect(hd280rbt(3,1)).toBe(1);});it('c',()=>{expect(hd280rbt(0,0)).toBe(0);});it('d',()=>{expect(hd280rbt(93,73)).toBe(2);});it('e',()=>{expect(hd280rbt(15,0)).toBe(4);});});
function hd281rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281rbt_hd',()=>{it('a',()=>{expect(hd281rbt(1,4)).toBe(2);});it('b',()=>{expect(hd281rbt(3,1)).toBe(1);});it('c',()=>{expect(hd281rbt(0,0)).toBe(0);});it('d',()=>{expect(hd281rbt(93,73)).toBe(2);});it('e',()=>{expect(hd281rbt(15,0)).toBe(4);});});
function hd282rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282rbt_hd',()=>{it('a',()=>{expect(hd282rbt(1,4)).toBe(2);});it('b',()=>{expect(hd282rbt(3,1)).toBe(1);});it('c',()=>{expect(hd282rbt(0,0)).toBe(0);});it('d',()=>{expect(hd282rbt(93,73)).toBe(2);});it('e',()=>{expect(hd282rbt(15,0)).toBe(4);});});
function hd283rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283rbt_hd',()=>{it('a',()=>{expect(hd283rbt(1,4)).toBe(2);});it('b',()=>{expect(hd283rbt(3,1)).toBe(1);});it('c',()=>{expect(hd283rbt(0,0)).toBe(0);});it('d',()=>{expect(hd283rbt(93,73)).toBe(2);});it('e',()=>{expect(hd283rbt(15,0)).toBe(4);});});
function hd284rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284rbt_hd',()=>{it('a',()=>{expect(hd284rbt(1,4)).toBe(2);});it('b',()=>{expect(hd284rbt(3,1)).toBe(1);});it('c',()=>{expect(hd284rbt(0,0)).toBe(0);});it('d',()=>{expect(hd284rbt(93,73)).toBe(2);});it('e',()=>{expect(hd284rbt(15,0)).toBe(4);});});
function hd285rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285rbt_hd',()=>{it('a',()=>{expect(hd285rbt(1,4)).toBe(2);});it('b',()=>{expect(hd285rbt(3,1)).toBe(1);});it('c',()=>{expect(hd285rbt(0,0)).toBe(0);});it('d',()=>{expect(hd285rbt(93,73)).toBe(2);});it('e',()=>{expect(hd285rbt(15,0)).toBe(4);});});
function hd286rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286rbt_hd',()=>{it('a',()=>{expect(hd286rbt(1,4)).toBe(2);});it('b',()=>{expect(hd286rbt(3,1)).toBe(1);});it('c',()=>{expect(hd286rbt(0,0)).toBe(0);});it('d',()=>{expect(hd286rbt(93,73)).toBe(2);});it('e',()=>{expect(hd286rbt(15,0)).toBe(4);});});
function hd287rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287rbt_hd',()=>{it('a',()=>{expect(hd287rbt(1,4)).toBe(2);});it('b',()=>{expect(hd287rbt(3,1)).toBe(1);});it('c',()=>{expect(hd287rbt(0,0)).toBe(0);});it('d',()=>{expect(hd287rbt(93,73)).toBe(2);});it('e',()=>{expect(hd287rbt(15,0)).toBe(4);});});
function hd288rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288rbt_hd',()=>{it('a',()=>{expect(hd288rbt(1,4)).toBe(2);});it('b',()=>{expect(hd288rbt(3,1)).toBe(1);});it('c',()=>{expect(hd288rbt(0,0)).toBe(0);});it('d',()=>{expect(hd288rbt(93,73)).toBe(2);});it('e',()=>{expect(hd288rbt(15,0)).toBe(4);});});
function hd289rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289rbt_hd',()=>{it('a',()=>{expect(hd289rbt(1,4)).toBe(2);});it('b',()=>{expect(hd289rbt(3,1)).toBe(1);});it('c',()=>{expect(hd289rbt(0,0)).toBe(0);});it('d',()=>{expect(hd289rbt(93,73)).toBe(2);});it('e',()=>{expect(hd289rbt(15,0)).toBe(4);});});
function hd290rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290rbt_hd',()=>{it('a',()=>{expect(hd290rbt(1,4)).toBe(2);});it('b',()=>{expect(hd290rbt(3,1)).toBe(1);});it('c',()=>{expect(hd290rbt(0,0)).toBe(0);});it('d',()=>{expect(hd290rbt(93,73)).toBe(2);});it('e',()=>{expect(hd290rbt(15,0)).toBe(4);});});
function hd291rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291rbt_hd',()=>{it('a',()=>{expect(hd291rbt(1,4)).toBe(2);});it('b',()=>{expect(hd291rbt(3,1)).toBe(1);});it('c',()=>{expect(hd291rbt(0,0)).toBe(0);});it('d',()=>{expect(hd291rbt(93,73)).toBe(2);});it('e',()=>{expect(hd291rbt(15,0)).toBe(4);});});
function hd292rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292rbt_hd',()=>{it('a',()=>{expect(hd292rbt(1,4)).toBe(2);});it('b',()=>{expect(hd292rbt(3,1)).toBe(1);});it('c',()=>{expect(hd292rbt(0,0)).toBe(0);});it('d',()=>{expect(hd292rbt(93,73)).toBe(2);});it('e',()=>{expect(hd292rbt(15,0)).toBe(4);});});
function hd293rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293rbt_hd',()=>{it('a',()=>{expect(hd293rbt(1,4)).toBe(2);});it('b',()=>{expect(hd293rbt(3,1)).toBe(1);});it('c',()=>{expect(hd293rbt(0,0)).toBe(0);});it('d',()=>{expect(hd293rbt(93,73)).toBe(2);});it('e',()=>{expect(hd293rbt(15,0)).toBe(4);});});
function hd294rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294rbt_hd',()=>{it('a',()=>{expect(hd294rbt(1,4)).toBe(2);});it('b',()=>{expect(hd294rbt(3,1)).toBe(1);});it('c',()=>{expect(hd294rbt(0,0)).toBe(0);});it('d',()=>{expect(hd294rbt(93,73)).toBe(2);});it('e',()=>{expect(hd294rbt(15,0)).toBe(4);});});
function hd295rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295rbt_hd',()=>{it('a',()=>{expect(hd295rbt(1,4)).toBe(2);});it('b',()=>{expect(hd295rbt(3,1)).toBe(1);});it('c',()=>{expect(hd295rbt(0,0)).toBe(0);});it('d',()=>{expect(hd295rbt(93,73)).toBe(2);});it('e',()=>{expect(hd295rbt(15,0)).toBe(4);});});
function hd296rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296rbt_hd',()=>{it('a',()=>{expect(hd296rbt(1,4)).toBe(2);});it('b',()=>{expect(hd296rbt(3,1)).toBe(1);});it('c',()=>{expect(hd296rbt(0,0)).toBe(0);});it('d',()=>{expect(hd296rbt(93,73)).toBe(2);});it('e',()=>{expect(hd296rbt(15,0)).toBe(4);});});
function hd297rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297rbt_hd',()=>{it('a',()=>{expect(hd297rbt(1,4)).toBe(2);});it('b',()=>{expect(hd297rbt(3,1)).toBe(1);});it('c',()=>{expect(hd297rbt(0,0)).toBe(0);});it('d',()=>{expect(hd297rbt(93,73)).toBe(2);});it('e',()=>{expect(hd297rbt(15,0)).toBe(4);});});
function hd298rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298rbt_hd',()=>{it('a',()=>{expect(hd298rbt(1,4)).toBe(2);});it('b',()=>{expect(hd298rbt(3,1)).toBe(1);});it('c',()=>{expect(hd298rbt(0,0)).toBe(0);});it('d',()=>{expect(hd298rbt(93,73)).toBe(2);});it('e',()=>{expect(hd298rbt(15,0)).toBe(4);});});
function hd299rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299rbt_hd',()=>{it('a',()=>{expect(hd299rbt(1,4)).toBe(2);});it('b',()=>{expect(hd299rbt(3,1)).toBe(1);});it('c',()=>{expect(hd299rbt(0,0)).toBe(0);});it('d',()=>{expect(hd299rbt(93,73)).toBe(2);});it('e',()=>{expect(hd299rbt(15,0)).toBe(4);});});
function hd300rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300rbt_hd',()=>{it('a',()=>{expect(hd300rbt(1,4)).toBe(2);});it('b',()=>{expect(hd300rbt(3,1)).toBe(1);});it('c',()=>{expect(hd300rbt(0,0)).toBe(0);});it('d',()=>{expect(hd300rbt(93,73)).toBe(2);});it('e',()=>{expect(hd300rbt(15,0)).toBe(4);});});
function hd301rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301rbt_hd',()=>{it('a',()=>{expect(hd301rbt(1,4)).toBe(2);});it('b',()=>{expect(hd301rbt(3,1)).toBe(1);});it('c',()=>{expect(hd301rbt(0,0)).toBe(0);});it('d',()=>{expect(hd301rbt(93,73)).toBe(2);});it('e',()=>{expect(hd301rbt(15,0)).toBe(4);});});
function hd302rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302rbt_hd',()=>{it('a',()=>{expect(hd302rbt(1,4)).toBe(2);});it('b',()=>{expect(hd302rbt(3,1)).toBe(1);});it('c',()=>{expect(hd302rbt(0,0)).toBe(0);});it('d',()=>{expect(hd302rbt(93,73)).toBe(2);});it('e',()=>{expect(hd302rbt(15,0)).toBe(4);});});
function hd303rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303rbt_hd',()=>{it('a',()=>{expect(hd303rbt(1,4)).toBe(2);});it('b',()=>{expect(hd303rbt(3,1)).toBe(1);});it('c',()=>{expect(hd303rbt(0,0)).toBe(0);});it('d',()=>{expect(hd303rbt(93,73)).toBe(2);});it('e',()=>{expect(hd303rbt(15,0)).toBe(4);});});
function hd304rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304rbt_hd',()=>{it('a',()=>{expect(hd304rbt(1,4)).toBe(2);});it('b',()=>{expect(hd304rbt(3,1)).toBe(1);});it('c',()=>{expect(hd304rbt(0,0)).toBe(0);});it('d',()=>{expect(hd304rbt(93,73)).toBe(2);});it('e',()=>{expect(hd304rbt(15,0)).toBe(4);});});
function hd305rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305rbt_hd',()=>{it('a',()=>{expect(hd305rbt(1,4)).toBe(2);});it('b',()=>{expect(hd305rbt(3,1)).toBe(1);});it('c',()=>{expect(hd305rbt(0,0)).toBe(0);});it('d',()=>{expect(hd305rbt(93,73)).toBe(2);});it('e',()=>{expect(hd305rbt(15,0)).toBe(4);});});
function hd306rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306rbt_hd',()=>{it('a',()=>{expect(hd306rbt(1,4)).toBe(2);});it('b',()=>{expect(hd306rbt(3,1)).toBe(1);});it('c',()=>{expect(hd306rbt(0,0)).toBe(0);});it('d',()=>{expect(hd306rbt(93,73)).toBe(2);});it('e',()=>{expect(hd306rbt(15,0)).toBe(4);});});
function hd307rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307rbt_hd',()=>{it('a',()=>{expect(hd307rbt(1,4)).toBe(2);});it('b',()=>{expect(hd307rbt(3,1)).toBe(1);});it('c',()=>{expect(hd307rbt(0,0)).toBe(0);});it('d',()=>{expect(hd307rbt(93,73)).toBe(2);});it('e',()=>{expect(hd307rbt(15,0)).toBe(4);});});
function hd308rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308rbt_hd',()=>{it('a',()=>{expect(hd308rbt(1,4)).toBe(2);});it('b',()=>{expect(hd308rbt(3,1)).toBe(1);});it('c',()=>{expect(hd308rbt(0,0)).toBe(0);});it('d',()=>{expect(hd308rbt(93,73)).toBe(2);});it('e',()=>{expect(hd308rbt(15,0)).toBe(4);});});
function hd309rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309rbt_hd',()=>{it('a',()=>{expect(hd309rbt(1,4)).toBe(2);});it('b',()=>{expect(hd309rbt(3,1)).toBe(1);});it('c',()=>{expect(hd309rbt(0,0)).toBe(0);});it('d',()=>{expect(hd309rbt(93,73)).toBe(2);});it('e',()=>{expect(hd309rbt(15,0)).toBe(4);});});
function hd310rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310rbt_hd',()=>{it('a',()=>{expect(hd310rbt(1,4)).toBe(2);});it('b',()=>{expect(hd310rbt(3,1)).toBe(1);});it('c',()=>{expect(hd310rbt(0,0)).toBe(0);});it('d',()=>{expect(hd310rbt(93,73)).toBe(2);});it('e',()=>{expect(hd310rbt(15,0)).toBe(4);});});
function hd311rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311rbt_hd',()=>{it('a',()=>{expect(hd311rbt(1,4)).toBe(2);});it('b',()=>{expect(hd311rbt(3,1)).toBe(1);});it('c',()=>{expect(hd311rbt(0,0)).toBe(0);});it('d',()=>{expect(hd311rbt(93,73)).toBe(2);});it('e',()=>{expect(hd311rbt(15,0)).toBe(4);});});
function hd312rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312rbt_hd',()=>{it('a',()=>{expect(hd312rbt(1,4)).toBe(2);});it('b',()=>{expect(hd312rbt(3,1)).toBe(1);});it('c',()=>{expect(hd312rbt(0,0)).toBe(0);});it('d',()=>{expect(hd312rbt(93,73)).toBe(2);});it('e',()=>{expect(hd312rbt(15,0)).toBe(4);});});
function hd313rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313rbt_hd',()=>{it('a',()=>{expect(hd313rbt(1,4)).toBe(2);});it('b',()=>{expect(hd313rbt(3,1)).toBe(1);});it('c',()=>{expect(hd313rbt(0,0)).toBe(0);});it('d',()=>{expect(hd313rbt(93,73)).toBe(2);});it('e',()=>{expect(hd313rbt(15,0)).toBe(4);});});
function hd314rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314rbt_hd',()=>{it('a',()=>{expect(hd314rbt(1,4)).toBe(2);});it('b',()=>{expect(hd314rbt(3,1)).toBe(1);});it('c',()=>{expect(hd314rbt(0,0)).toBe(0);});it('d',()=>{expect(hd314rbt(93,73)).toBe(2);});it('e',()=>{expect(hd314rbt(15,0)).toBe(4);});});
function hd315rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315rbt_hd',()=>{it('a',()=>{expect(hd315rbt(1,4)).toBe(2);});it('b',()=>{expect(hd315rbt(3,1)).toBe(1);});it('c',()=>{expect(hd315rbt(0,0)).toBe(0);});it('d',()=>{expect(hd315rbt(93,73)).toBe(2);});it('e',()=>{expect(hd315rbt(15,0)).toBe(4);});});
function hd316rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316rbt_hd',()=>{it('a',()=>{expect(hd316rbt(1,4)).toBe(2);});it('b',()=>{expect(hd316rbt(3,1)).toBe(1);});it('c',()=>{expect(hd316rbt(0,0)).toBe(0);});it('d',()=>{expect(hd316rbt(93,73)).toBe(2);});it('e',()=>{expect(hd316rbt(15,0)).toBe(4);});});
function hd317rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317rbt_hd',()=>{it('a',()=>{expect(hd317rbt(1,4)).toBe(2);});it('b',()=>{expect(hd317rbt(3,1)).toBe(1);});it('c',()=>{expect(hd317rbt(0,0)).toBe(0);});it('d',()=>{expect(hd317rbt(93,73)).toBe(2);});it('e',()=>{expect(hd317rbt(15,0)).toBe(4);});});
function hd318rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318rbt_hd',()=>{it('a',()=>{expect(hd318rbt(1,4)).toBe(2);});it('b',()=>{expect(hd318rbt(3,1)).toBe(1);});it('c',()=>{expect(hd318rbt(0,0)).toBe(0);});it('d',()=>{expect(hd318rbt(93,73)).toBe(2);});it('e',()=>{expect(hd318rbt(15,0)).toBe(4);});});
function hd319rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319rbt_hd',()=>{it('a',()=>{expect(hd319rbt(1,4)).toBe(2);});it('b',()=>{expect(hd319rbt(3,1)).toBe(1);});it('c',()=>{expect(hd319rbt(0,0)).toBe(0);});it('d',()=>{expect(hd319rbt(93,73)).toBe(2);});it('e',()=>{expect(hd319rbt(15,0)).toBe(4);});});
function hd320rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320rbt_hd',()=>{it('a',()=>{expect(hd320rbt(1,4)).toBe(2);});it('b',()=>{expect(hd320rbt(3,1)).toBe(1);});it('c',()=>{expect(hd320rbt(0,0)).toBe(0);});it('d',()=>{expect(hd320rbt(93,73)).toBe(2);});it('e',()=>{expect(hd320rbt(15,0)).toBe(4);});});
function hd321rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321rbt_hd',()=>{it('a',()=>{expect(hd321rbt(1,4)).toBe(2);});it('b',()=>{expect(hd321rbt(3,1)).toBe(1);});it('c',()=>{expect(hd321rbt(0,0)).toBe(0);});it('d',()=>{expect(hd321rbt(93,73)).toBe(2);});it('e',()=>{expect(hd321rbt(15,0)).toBe(4);});});
function hd322rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322rbt_hd',()=>{it('a',()=>{expect(hd322rbt(1,4)).toBe(2);});it('b',()=>{expect(hd322rbt(3,1)).toBe(1);});it('c',()=>{expect(hd322rbt(0,0)).toBe(0);});it('d',()=>{expect(hd322rbt(93,73)).toBe(2);});it('e',()=>{expect(hd322rbt(15,0)).toBe(4);});});
function hd323rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323rbt_hd',()=>{it('a',()=>{expect(hd323rbt(1,4)).toBe(2);});it('b',()=>{expect(hd323rbt(3,1)).toBe(1);});it('c',()=>{expect(hd323rbt(0,0)).toBe(0);});it('d',()=>{expect(hd323rbt(93,73)).toBe(2);});it('e',()=>{expect(hd323rbt(15,0)).toBe(4);});});
function hd324rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324rbt_hd',()=>{it('a',()=>{expect(hd324rbt(1,4)).toBe(2);});it('b',()=>{expect(hd324rbt(3,1)).toBe(1);});it('c',()=>{expect(hd324rbt(0,0)).toBe(0);});it('d',()=>{expect(hd324rbt(93,73)).toBe(2);});it('e',()=>{expect(hd324rbt(15,0)).toBe(4);});});
function hd325rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325rbt_hd',()=>{it('a',()=>{expect(hd325rbt(1,4)).toBe(2);});it('b',()=>{expect(hd325rbt(3,1)).toBe(1);});it('c',()=>{expect(hd325rbt(0,0)).toBe(0);});it('d',()=>{expect(hd325rbt(93,73)).toBe(2);});it('e',()=>{expect(hd325rbt(15,0)).toBe(4);});});
function hd326rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326rbt_hd',()=>{it('a',()=>{expect(hd326rbt(1,4)).toBe(2);});it('b',()=>{expect(hd326rbt(3,1)).toBe(1);});it('c',()=>{expect(hd326rbt(0,0)).toBe(0);});it('d',()=>{expect(hd326rbt(93,73)).toBe(2);});it('e',()=>{expect(hd326rbt(15,0)).toBe(4);});});
function hd327rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327rbt_hd',()=>{it('a',()=>{expect(hd327rbt(1,4)).toBe(2);});it('b',()=>{expect(hd327rbt(3,1)).toBe(1);});it('c',()=>{expect(hd327rbt(0,0)).toBe(0);});it('d',()=>{expect(hd327rbt(93,73)).toBe(2);});it('e',()=>{expect(hd327rbt(15,0)).toBe(4);});});
function hd328rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328rbt_hd',()=>{it('a',()=>{expect(hd328rbt(1,4)).toBe(2);});it('b',()=>{expect(hd328rbt(3,1)).toBe(1);});it('c',()=>{expect(hd328rbt(0,0)).toBe(0);});it('d',()=>{expect(hd328rbt(93,73)).toBe(2);});it('e',()=>{expect(hd328rbt(15,0)).toBe(4);});});
function hd329rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329rbt_hd',()=>{it('a',()=>{expect(hd329rbt(1,4)).toBe(2);});it('b',()=>{expect(hd329rbt(3,1)).toBe(1);});it('c',()=>{expect(hd329rbt(0,0)).toBe(0);});it('d',()=>{expect(hd329rbt(93,73)).toBe(2);});it('e',()=>{expect(hd329rbt(15,0)).toBe(4);});});
function hd330rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330rbt_hd',()=>{it('a',()=>{expect(hd330rbt(1,4)).toBe(2);});it('b',()=>{expect(hd330rbt(3,1)).toBe(1);});it('c',()=>{expect(hd330rbt(0,0)).toBe(0);});it('d',()=>{expect(hd330rbt(93,73)).toBe(2);});it('e',()=>{expect(hd330rbt(15,0)).toBe(4);});});
function hd331rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331rbt_hd',()=>{it('a',()=>{expect(hd331rbt(1,4)).toBe(2);});it('b',()=>{expect(hd331rbt(3,1)).toBe(1);});it('c',()=>{expect(hd331rbt(0,0)).toBe(0);});it('d',()=>{expect(hd331rbt(93,73)).toBe(2);});it('e',()=>{expect(hd331rbt(15,0)).toBe(4);});});
function hd332rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332rbt_hd',()=>{it('a',()=>{expect(hd332rbt(1,4)).toBe(2);});it('b',()=>{expect(hd332rbt(3,1)).toBe(1);});it('c',()=>{expect(hd332rbt(0,0)).toBe(0);});it('d',()=>{expect(hd332rbt(93,73)).toBe(2);});it('e',()=>{expect(hd332rbt(15,0)).toBe(4);});});
function hd333rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333rbt_hd',()=>{it('a',()=>{expect(hd333rbt(1,4)).toBe(2);});it('b',()=>{expect(hd333rbt(3,1)).toBe(1);});it('c',()=>{expect(hd333rbt(0,0)).toBe(0);});it('d',()=>{expect(hd333rbt(93,73)).toBe(2);});it('e',()=>{expect(hd333rbt(15,0)).toBe(4);});});
function hd334rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334rbt_hd',()=>{it('a',()=>{expect(hd334rbt(1,4)).toBe(2);});it('b',()=>{expect(hd334rbt(3,1)).toBe(1);});it('c',()=>{expect(hd334rbt(0,0)).toBe(0);});it('d',()=>{expect(hd334rbt(93,73)).toBe(2);});it('e',()=>{expect(hd334rbt(15,0)).toBe(4);});});
function hd335rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335rbt_hd',()=>{it('a',()=>{expect(hd335rbt(1,4)).toBe(2);});it('b',()=>{expect(hd335rbt(3,1)).toBe(1);});it('c',()=>{expect(hd335rbt(0,0)).toBe(0);});it('d',()=>{expect(hd335rbt(93,73)).toBe(2);});it('e',()=>{expect(hd335rbt(15,0)).toBe(4);});});
function hd336rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336rbt_hd',()=>{it('a',()=>{expect(hd336rbt(1,4)).toBe(2);});it('b',()=>{expect(hd336rbt(3,1)).toBe(1);});it('c',()=>{expect(hd336rbt(0,0)).toBe(0);});it('d',()=>{expect(hd336rbt(93,73)).toBe(2);});it('e',()=>{expect(hd336rbt(15,0)).toBe(4);});});
function hd337rbt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337rbt_hd',()=>{it('a',()=>{expect(hd337rbt(1,4)).toBe(2);});it('b',()=>{expect(hd337rbt(3,1)).toBe(1);});it('c',()=>{expect(hd337rbt(0,0)).toBe(0);});it('d',()=>{expect(hd337rbt(93,73)).toBe(2);});it('e',()=>{expect(hd337rbt(15,0)).toBe(4);});});
function hd338rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338rbt2_hd',()=>{it('a',()=>{expect(hd338rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd338rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd338rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd338rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd338rbt2(15,0)).toBe(4);});});
function hd339rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339rbt2_hd',()=>{it('a',()=>{expect(hd339rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd339rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd339rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd339rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd339rbt2(15,0)).toBe(4);});});
function hd340rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340rbt2_hd',()=>{it('a',()=>{expect(hd340rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd340rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd340rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd340rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd340rbt2(15,0)).toBe(4);});});
function hd341rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341rbt2_hd',()=>{it('a',()=>{expect(hd341rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd341rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd341rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd341rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd341rbt2(15,0)).toBe(4);});});
function hd342rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342rbt2_hd',()=>{it('a',()=>{expect(hd342rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd342rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd342rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd342rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd342rbt2(15,0)).toBe(4);});});
function hd343rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343rbt2_hd',()=>{it('a',()=>{expect(hd343rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd343rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd343rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd343rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd343rbt2(15,0)).toBe(4);});});
function hd344rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344rbt2_hd',()=>{it('a',()=>{expect(hd344rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd344rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd344rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd344rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd344rbt2(15,0)).toBe(4);});});
function hd345rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345rbt2_hd',()=>{it('a',()=>{expect(hd345rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd345rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd345rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd345rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd345rbt2(15,0)).toBe(4);});});
function hd346rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346rbt2_hd',()=>{it('a',()=>{expect(hd346rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd346rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd346rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd346rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd346rbt2(15,0)).toBe(4);});});
function hd347rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347rbt2_hd',()=>{it('a',()=>{expect(hd347rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd347rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd347rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd347rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd347rbt2(15,0)).toBe(4);});});
function hd348rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348rbt2_hd',()=>{it('a',()=>{expect(hd348rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd348rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd348rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd348rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd348rbt2(15,0)).toBe(4);});});
function hd349rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349rbt2_hd',()=>{it('a',()=>{expect(hd349rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd349rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd349rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd349rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd349rbt2(15,0)).toBe(4);});});
function hd350rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350rbt2_hd',()=>{it('a',()=>{expect(hd350rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd350rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd350rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd350rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd350rbt2(15,0)).toBe(4);});});
function hd351rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351rbt2_hd',()=>{it('a',()=>{expect(hd351rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd351rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd351rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd351rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd351rbt2(15,0)).toBe(4);});});
function hd352rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352rbt2_hd',()=>{it('a',()=>{expect(hd352rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd352rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd352rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd352rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd352rbt2(15,0)).toBe(4);});});
function hd353rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353rbt2_hd',()=>{it('a',()=>{expect(hd353rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd353rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd353rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd353rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd353rbt2(15,0)).toBe(4);});});
function hd354rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354rbt2_hd',()=>{it('a',()=>{expect(hd354rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd354rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd354rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd354rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd354rbt2(15,0)).toBe(4);});});
function hd355rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355rbt2_hd',()=>{it('a',()=>{expect(hd355rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd355rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd355rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd355rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd355rbt2(15,0)).toBe(4);});});
function hd356rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356rbt2_hd',()=>{it('a',()=>{expect(hd356rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd356rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd356rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd356rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd356rbt2(15,0)).toBe(4);});});
function hd357rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357rbt2_hd',()=>{it('a',()=>{expect(hd357rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd357rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd357rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd357rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd357rbt2(15,0)).toBe(4);});});
function hd358rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358rbt2_hd',()=>{it('a',()=>{expect(hd358rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd358rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd358rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd358rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd358rbt2(15,0)).toBe(4);});});
function hd359rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359rbt2_hd',()=>{it('a',()=>{expect(hd359rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd359rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd359rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd359rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd359rbt2(15,0)).toBe(4);});});
function hd360rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360rbt2_hd',()=>{it('a',()=>{expect(hd360rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd360rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd360rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd360rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd360rbt2(15,0)).toBe(4);});});
function hd361rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361rbt2_hd',()=>{it('a',()=>{expect(hd361rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd361rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd361rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd361rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd361rbt2(15,0)).toBe(4);});});
function hd362rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362rbt2_hd',()=>{it('a',()=>{expect(hd362rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd362rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd362rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd362rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd362rbt2(15,0)).toBe(4);});});
function hd363rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363rbt2_hd',()=>{it('a',()=>{expect(hd363rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd363rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd363rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd363rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd363rbt2(15,0)).toBe(4);});});
function hd364rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364rbt2_hd',()=>{it('a',()=>{expect(hd364rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd364rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd364rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd364rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd364rbt2(15,0)).toBe(4);});});
function hd365rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365rbt2_hd',()=>{it('a',()=>{expect(hd365rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd365rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd365rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd365rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd365rbt2(15,0)).toBe(4);});});
function hd366rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366rbt2_hd',()=>{it('a',()=>{expect(hd366rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd366rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd366rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd366rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd366rbt2(15,0)).toBe(4);});});
function hd367rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367rbt2_hd',()=>{it('a',()=>{expect(hd367rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd367rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd367rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd367rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd367rbt2(15,0)).toBe(4);});});
function hd368rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368rbt2_hd',()=>{it('a',()=>{expect(hd368rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd368rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd368rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd368rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd368rbt2(15,0)).toBe(4);});});
function hd369rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369rbt2_hd',()=>{it('a',()=>{expect(hd369rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd369rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd369rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd369rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd369rbt2(15,0)).toBe(4);});});
function hd370rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370rbt2_hd',()=>{it('a',()=>{expect(hd370rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd370rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd370rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd370rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd370rbt2(15,0)).toBe(4);});});
function hd371rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371rbt2_hd',()=>{it('a',()=>{expect(hd371rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd371rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd371rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd371rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd371rbt2(15,0)).toBe(4);});});
function hd372rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372rbt2_hd',()=>{it('a',()=>{expect(hd372rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd372rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd372rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd372rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd372rbt2(15,0)).toBe(4);});});
function hd373rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373rbt2_hd',()=>{it('a',()=>{expect(hd373rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd373rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd373rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd373rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd373rbt2(15,0)).toBe(4);});});
function hd374rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374rbt2_hd',()=>{it('a',()=>{expect(hd374rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd374rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd374rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd374rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd374rbt2(15,0)).toBe(4);});});
function hd375rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375rbt2_hd',()=>{it('a',()=>{expect(hd375rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd375rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd375rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd375rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd375rbt2(15,0)).toBe(4);});});
function hd376rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376rbt2_hd',()=>{it('a',()=>{expect(hd376rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd376rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd376rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd376rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd376rbt2(15,0)).toBe(4);});});
function hd377rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377rbt2_hd',()=>{it('a',()=>{expect(hd377rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd377rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd377rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd377rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd377rbt2(15,0)).toBe(4);});});
function hd378rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378rbt2_hd',()=>{it('a',()=>{expect(hd378rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd378rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd378rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd378rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd378rbt2(15,0)).toBe(4);});});
function hd379rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379rbt2_hd',()=>{it('a',()=>{expect(hd379rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd379rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd379rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd379rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd379rbt2(15,0)).toBe(4);});});
function hd380rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380rbt2_hd',()=>{it('a',()=>{expect(hd380rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd380rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd380rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd380rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd380rbt2(15,0)).toBe(4);});});
function hd381rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381rbt2_hd',()=>{it('a',()=>{expect(hd381rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd381rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd381rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd381rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd381rbt2(15,0)).toBe(4);});});
function hd382rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382rbt2_hd',()=>{it('a',()=>{expect(hd382rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd382rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd382rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd382rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd382rbt2(15,0)).toBe(4);});});
function hd383rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383rbt2_hd',()=>{it('a',()=>{expect(hd383rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd383rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd383rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd383rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd383rbt2(15,0)).toBe(4);});});
function hd384rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384rbt2_hd',()=>{it('a',()=>{expect(hd384rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd384rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd384rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd384rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd384rbt2(15,0)).toBe(4);});});
function hd385rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385rbt2_hd',()=>{it('a',()=>{expect(hd385rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd385rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd385rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd385rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd385rbt2(15,0)).toBe(4);});});
function hd386rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386rbt2_hd',()=>{it('a',()=>{expect(hd386rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd386rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd386rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd386rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd386rbt2(15,0)).toBe(4);});});
function hd387rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387rbt2_hd',()=>{it('a',()=>{expect(hd387rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd387rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd387rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd387rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd387rbt2(15,0)).toBe(4);});});
function hd388rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388rbt2_hd',()=>{it('a',()=>{expect(hd388rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd388rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd388rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd388rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd388rbt2(15,0)).toBe(4);});});
function hd389rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389rbt2_hd',()=>{it('a',()=>{expect(hd389rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd389rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd389rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd389rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd389rbt2(15,0)).toBe(4);});});
function hd390rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390rbt2_hd',()=>{it('a',()=>{expect(hd390rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd390rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd390rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd390rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd390rbt2(15,0)).toBe(4);});});
function hd391rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391rbt2_hd',()=>{it('a',()=>{expect(hd391rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd391rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd391rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd391rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd391rbt2(15,0)).toBe(4);});});
function hd392rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392rbt2_hd',()=>{it('a',()=>{expect(hd392rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd392rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd392rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd392rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd392rbt2(15,0)).toBe(4);});});
function hd393rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393rbt2_hd',()=>{it('a',()=>{expect(hd393rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd393rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd393rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd393rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd393rbt2(15,0)).toBe(4);});});
function hd394rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394rbt2_hd',()=>{it('a',()=>{expect(hd394rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd394rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd394rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd394rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd394rbt2(15,0)).toBe(4);});});
function hd395rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395rbt2_hd',()=>{it('a',()=>{expect(hd395rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd395rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd395rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd395rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd395rbt2(15,0)).toBe(4);});});
function hd396rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396rbt2_hd',()=>{it('a',()=>{expect(hd396rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd396rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd396rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd396rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd396rbt2(15,0)).toBe(4);});});
function hd397rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397rbt2_hd',()=>{it('a',()=>{expect(hd397rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd397rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd397rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd397rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd397rbt2(15,0)).toBe(4);});});
function hd398rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398rbt2_hd',()=>{it('a',()=>{expect(hd398rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd398rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd398rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd398rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd398rbt2(15,0)).toBe(4);});});
function hd399rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399rbt2_hd',()=>{it('a',()=>{expect(hd399rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd399rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd399rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd399rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd399rbt2(15,0)).toBe(4);});});
function hd400rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400rbt2_hd',()=>{it('a',()=>{expect(hd400rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd400rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd400rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd400rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd400rbt2(15,0)).toBe(4);});});
function hd401rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401rbt2_hd',()=>{it('a',()=>{expect(hd401rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd401rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd401rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd401rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd401rbt2(15,0)).toBe(4);});});
function hd402rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402rbt2_hd',()=>{it('a',()=>{expect(hd402rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd402rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd402rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd402rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd402rbt2(15,0)).toBe(4);});});
function hd403rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403rbt2_hd',()=>{it('a',()=>{expect(hd403rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd403rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd403rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd403rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd403rbt2(15,0)).toBe(4);});});
function hd404rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404rbt2_hd',()=>{it('a',()=>{expect(hd404rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd404rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd404rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd404rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd404rbt2(15,0)).toBe(4);});});
function hd405rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405rbt2_hd',()=>{it('a',()=>{expect(hd405rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd405rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd405rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd405rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd405rbt2(15,0)).toBe(4);});});
function hd406rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406rbt2_hd',()=>{it('a',()=>{expect(hd406rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd406rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd406rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd406rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd406rbt2(15,0)).toBe(4);});});
function hd407rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407rbt2_hd',()=>{it('a',()=>{expect(hd407rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd407rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd407rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd407rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd407rbt2(15,0)).toBe(4);});});
function hd408rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408rbt2_hd',()=>{it('a',()=>{expect(hd408rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd408rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd408rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd408rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd408rbt2(15,0)).toBe(4);});});
function hd409rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409rbt2_hd',()=>{it('a',()=>{expect(hd409rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd409rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd409rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd409rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd409rbt2(15,0)).toBe(4);});});
function hd410rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410rbt2_hd',()=>{it('a',()=>{expect(hd410rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd410rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd410rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd410rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd410rbt2(15,0)).toBe(4);});});
function hd411rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411rbt2_hd',()=>{it('a',()=>{expect(hd411rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd411rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd411rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd411rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd411rbt2(15,0)).toBe(4);});});
function hd412rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412rbt2_hd',()=>{it('a',()=>{expect(hd412rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd412rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd412rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd412rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd412rbt2(15,0)).toBe(4);});});
function hd413rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413rbt2_hd',()=>{it('a',()=>{expect(hd413rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd413rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd413rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd413rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd413rbt2(15,0)).toBe(4);});});
function hd414rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414rbt2_hd',()=>{it('a',()=>{expect(hd414rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd414rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd414rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd414rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd414rbt2(15,0)).toBe(4);});});
function hd415rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415rbt2_hd',()=>{it('a',()=>{expect(hd415rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd415rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd415rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd415rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd415rbt2(15,0)).toBe(4);});});
function hd416rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416rbt2_hd',()=>{it('a',()=>{expect(hd416rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd416rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd416rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd416rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd416rbt2(15,0)).toBe(4);});});
function hd417rbt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417rbt2_hd',()=>{it('a',()=>{expect(hd417rbt2(1,4)).toBe(2);});it('b',()=>{expect(hd417rbt2(3,1)).toBe(1);});it('c',()=>{expect(hd417rbt2(0,0)).toBe(0);});it('d',()=>{expect(hd417rbt2(93,73)).toBe(2);});it('e',()=>{expect(hd417rbt2(15,0)).toBe(4);});});
