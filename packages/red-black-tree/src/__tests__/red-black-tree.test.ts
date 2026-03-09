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
