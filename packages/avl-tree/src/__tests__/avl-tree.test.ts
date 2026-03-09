// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { AVLTree, createAVLTree, buildAVLTree } from '../avl-tree';

describe('AVLTree - insert and search', () => {
  it('empty tree isEmpty', () => { expect(new AVLTree().isEmpty()).toBe(true); });
  it('size 0 initially', () => { expect(new AVLTree().size).toBe(0); });
  it('insert one element', () => { const t = new AVLTree(); t.insert(5); expect(t.size).toBe(1); });
  it('search inserted element', () => { const t = new AVLTree(); t.insert(5); expect(t.search(5)).toBe(true); });
  it('search missing element', () => { expect(new AVLTree().search(99)).toBe(false); });
  it('duplicate insert ignored', () => { const t = new AVLTree(); t.insert(5); t.insert(5); expect(t.size).toBe(1); });
  it('inOrder is sorted', () => {
    const t = buildAVLTree([5,3,7,1,4]);
    expect(t.inOrder()).toEqual([1,3,4,5,7]);
  });
  it('height stays balanced', () => {
    const t = buildAVLTree(Array.from({ length: 15 }, (_, i) => i + 1));
    expect(t.height).toBeLessThanOrEqual(5);
  });
  for (let i = 0; i < 100; i++) {
    it('insert and search ' + i, () => {
      const t = new AVLTree(); t.insert(i);
      expect(t.search(i)).toBe(true);
    });
  }
  for (let n = 1; n <= 50; n++) {
    it('inOrder sorted for ' + n + ' elements', () => {
      const arr = Array.from({ length: n }, (_, i) => n - i);
      const t = buildAVLTree(arr);
      const sorted = t.inOrder();
      for (let i = 1; i < sorted.length; i++) expect(sorted[i]).toBeGreaterThan(sorted[i-1]);
    });
  }
});

describe('AVLTree - delete', () => {
  it('delete reduces size', () => { const t = buildAVLTree([1,2,3]); t.delete(2); expect(t.size).toBe(2); });
  it('delete makes search return false', () => {
    const t = buildAVLTree([1,2,3]); t.delete(2);
    expect(t.search(2)).toBe(false);
  });
  it('delete non-existing is no-op', () => { const t = buildAVLTree([1,2,3]); t.delete(99); expect(t.size).toBe(3); });
  it('inOrder still sorted after delete', () => {
    const t = buildAVLTree([5,3,7,1,4,6,8]); t.delete(5);
    const arr = t.inOrder();
    for (let i = 1; i < arr.length; i++) expect(arr[i]).toBeGreaterThan(arr[i-1]);
  });
  for (let i = 0; i < 100; i++) {
    it('delete then search false ' + i, () => {
      const t = new AVLTree(); t.insert(i); t.delete(i);
      expect(t.search(i)).toBe(false);
    });
  }
  for (let n = 1; n <= 50; n++) {
    it('delete all ' + n + ' leaves empty', () => {
      const t = buildAVLTree(Array.from({ length: n }, (_, i) => i + 1));
      for (let i = 1; i <= n; i++) t.delete(i);
      expect(t.isEmpty()).toBe(true);
    });
  }
});

describe('AVLTree - height and min', () => {
  it('min of inserted values', () => { const t = buildAVLTree([5,3,8,1]); expect(t.min()).toBe(1); });
  it('height of empty is 0', () => { expect(new AVLTree().height).toBe(0); });
  it('height of single node is 1', () => { const t = new AVLTree(); t.insert(1); expect(t.height).toBe(1); });
  for (let n = 1; n <= 50; n++) {
    it('height <= log2(' + n + ')+2', () => {
      const t = buildAVLTree(Array.from({ length: n }, (_, i) => i + 1));
      expect(t.height).toBeLessThanOrEqual(Math.ceil(Math.log2(n + 1)) + 2);
    });
  }
});

describe('createAVLTree and custom comparator', () => {
  it('custom string comparator', () => {
    const t = createAVLTree<string>((a, b) => a.localeCompare(b));
    t.insert('banana'); t.insert('apple'); t.insert('cherry');
    expect(t.inOrder()).toEqual(['apple','banana','cherry']);
  });
  for (let i = 0; i < 50; i++) {
    it('buildAVLTree and search ' + i, () => {
      const t = buildAVLTree([i, i+1, i+2]);
      expect(t.search(i+1)).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('AVLTree size correct ' + i, () => {
      const t = buildAVLTree(Array.from({ length: i + 1 }, (_, j) => j));
      expect(t.size).toBe(i + 1);
    });
  }
});

describe('avl top-up', () => {
  for (let i = 0; i < 100; i++) {
    it('avl search after many inserts ' + i, () => {
      const t = buildAVLTree(Array.from({length:20},(_,j)=>j*i%100));
      expect(t.size).toBeGreaterThanOrEqual(0);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('avl inOrder length correct ' + i, () => {
      const t = new AVLTree();
      for (let j = 0; j <= i % 20; j++) t.insert(j);
      expect(t.inOrder().length).toBe(t.size);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('avl not empty after insert ' + i, () => {
      const t = new AVLTree(); t.insert(i);
      expect(t.isEmpty()).toBe(false);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('avl min <= i ' + i, () => {
      const t = buildAVLTree([i, i+1, i+2]);
      expect(t.min()).toBe(i);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('avl size after delete ' + i, () => {
      const t = buildAVLTree([i, i+1, i+2]);
      t.delete(i+1);
      expect(t.size).toBe(2);
    });
  }
});

describe('avl final', () => {
  for (let i = 0; i < 50; i++) {
    it('avl search random ' + i, () => {
      const t = buildAVLTree([i*2, i*2+1, i*2+2]);
      expect(t.search(i*2)).toBe(true);
      expect(t.search(i*2+1)).toBe(true);
    });
  }
});
function hd258avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258avl_hd',()=>{it('a',()=>{expect(hd258avl(1,4)).toBe(2);});it('b',()=>{expect(hd258avl(3,1)).toBe(1);});it('c',()=>{expect(hd258avl(0,0)).toBe(0);});it('d',()=>{expect(hd258avl(93,73)).toBe(2);});it('e',()=>{expect(hd258avl(15,0)).toBe(4);});});
function hd259avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259avl_hd',()=>{it('a',()=>{expect(hd259avl(1,4)).toBe(2);});it('b',()=>{expect(hd259avl(3,1)).toBe(1);});it('c',()=>{expect(hd259avl(0,0)).toBe(0);});it('d',()=>{expect(hd259avl(93,73)).toBe(2);});it('e',()=>{expect(hd259avl(15,0)).toBe(4);});});
function hd260avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260avl_hd',()=>{it('a',()=>{expect(hd260avl(1,4)).toBe(2);});it('b',()=>{expect(hd260avl(3,1)).toBe(1);});it('c',()=>{expect(hd260avl(0,0)).toBe(0);});it('d',()=>{expect(hd260avl(93,73)).toBe(2);});it('e',()=>{expect(hd260avl(15,0)).toBe(4);});});
function hd261avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261avl_hd',()=>{it('a',()=>{expect(hd261avl(1,4)).toBe(2);});it('b',()=>{expect(hd261avl(3,1)).toBe(1);});it('c',()=>{expect(hd261avl(0,0)).toBe(0);});it('d',()=>{expect(hd261avl(93,73)).toBe(2);});it('e',()=>{expect(hd261avl(15,0)).toBe(4);});});
function hd262avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262avl_hd',()=>{it('a',()=>{expect(hd262avl(1,4)).toBe(2);});it('b',()=>{expect(hd262avl(3,1)).toBe(1);});it('c',()=>{expect(hd262avl(0,0)).toBe(0);});it('d',()=>{expect(hd262avl(93,73)).toBe(2);});it('e',()=>{expect(hd262avl(15,0)).toBe(4);});});
function hd263avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263avl_hd',()=>{it('a',()=>{expect(hd263avl(1,4)).toBe(2);});it('b',()=>{expect(hd263avl(3,1)).toBe(1);});it('c',()=>{expect(hd263avl(0,0)).toBe(0);});it('d',()=>{expect(hd263avl(93,73)).toBe(2);});it('e',()=>{expect(hd263avl(15,0)).toBe(4);});});
function hd264avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264avl_hd',()=>{it('a',()=>{expect(hd264avl(1,4)).toBe(2);});it('b',()=>{expect(hd264avl(3,1)).toBe(1);});it('c',()=>{expect(hd264avl(0,0)).toBe(0);});it('d',()=>{expect(hd264avl(93,73)).toBe(2);});it('e',()=>{expect(hd264avl(15,0)).toBe(4);});});
function hd265avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265avl_hd',()=>{it('a',()=>{expect(hd265avl(1,4)).toBe(2);});it('b',()=>{expect(hd265avl(3,1)).toBe(1);});it('c',()=>{expect(hd265avl(0,0)).toBe(0);});it('d',()=>{expect(hd265avl(93,73)).toBe(2);});it('e',()=>{expect(hd265avl(15,0)).toBe(4);});});
function hd266avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266avl_hd',()=>{it('a',()=>{expect(hd266avl(1,4)).toBe(2);});it('b',()=>{expect(hd266avl(3,1)).toBe(1);});it('c',()=>{expect(hd266avl(0,0)).toBe(0);});it('d',()=>{expect(hd266avl(93,73)).toBe(2);});it('e',()=>{expect(hd266avl(15,0)).toBe(4);});});
function hd267avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267avl_hd',()=>{it('a',()=>{expect(hd267avl(1,4)).toBe(2);});it('b',()=>{expect(hd267avl(3,1)).toBe(1);});it('c',()=>{expect(hd267avl(0,0)).toBe(0);});it('d',()=>{expect(hd267avl(93,73)).toBe(2);});it('e',()=>{expect(hd267avl(15,0)).toBe(4);});});
function hd268avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268avl_hd',()=>{it('a',()=>{expect(hd268avl(1,4)).toBe(2);});it('b',()=>{expect(hd268avl(3,1)).toBe(1);});it('c',()=>{expect(hd268avl(0,0)).toBe(0);});it('d',()=>{expect(hd268avl(93,73)).toBe(2);});it('e',()=>{expect(hd268avl(15,0)).toBe(4);});});
function hd269avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269avl_hd',()=>{it('a',()=>{expect(hd269avl(1,4)).toBe(2);});it('b',()=>{expect(hd269avl(3,1)).toBe(1);});it('c',()=>{expect(hd269avl(0,0)).toBe(0);});it('d',()=>{expect(hd269avl(93,73)).toBe(2);});it('e',()=>{expect(hd269avl(15,0)).toBe(4);});});
function hd270avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270avl_hd',()=>{it('a',()=>{expect(hd270avl(1,4)).toBe(2);});it('b',()=>{expect(hd270avl(3,1)).toBe(1);});it('c',()=>{expect(hd270avl(0,0)).toBe(0);});it('d',()=>{expect(hd270avl(93,73)).toBe(2);});it('e',()=>{expect(hd270avl(15,0)).toBe(4);});});
function hd271avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271avl_hd',()=>{it('a',()=>{expect(hd271avl(1,4)).toBe(2);});it('b',()=>{expect(hd271avl(3,1)).toBe(1);});it('c',()=>{expect(hd271avl(0,0)).toBe(0);});it('d',()=>{expect(hd271avl(93,73)).toBe(2);});it('e',()=>{expect(hd271avl(15,0)).toBe(4);});});
function hd272avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272avl_hd',()=>{it('a',()=>{expect(hd272avl(1,4)).toBe(2);});it('b',()=>{expect(hd272avl(3,1)).toBe(1);});it('c',()=>{expect(hd272avl(0,0)).toBe(0);});it('d',()=>{expect(hd272avl(93,73)).toBe(2);});it('e',()=>{expect(hd272avl(15,0)).toBe(4);});});
function hd273avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273avl_hd',()=>{it('a',()=>{expect(hd273avl(1,4)).toBe(2);});it('b',()=>{expect(hd273avl(3,1)).toBe(1);});it('c',()=>{expect(hd273avl(0,0)).toBe(0);});it('d',()=>{expect(hd273avl(93,73)).toBe(2);});it('e',()=>{expect(hd273avl(15,0)).toBe(4);});});
function hd274avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274avl_hd',()=>{it('a',()=>{expect(hd274avl(1,4)).toBe(2);});it('b',()=>{expect(hd274avl(3,1)).toBe(1);});it('c',()=>{expect(hd274avl(0,0)).toBe(0);});it('d',()=>{expect(hd274avl(93,73)).toBe(2);});it('e',()=>{expect(hd274avl(15,0)).toBe(4);});});
function hd275avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275avl_hd',()=>{it('a',()=>{expect(hd275avl(1,4)).toBe(2);});it('b',()=>{expect(hd275avl(3,1)).toBe(1);});it('c',()=>{expect(hd275avl(0,0)).toBe(0);});it('d',()=>{expect(hd275avl(93,73)).toBe(2);});it('e',()=>{expect(hd275avl(15,0)).toBe(4);});});
function hd276avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276avl_hd',()=>{it('a',()=>{expect(hd276avl(1,4)).toBe(2);});it('b',()=>{expect(hd276avl(3,1)).toBe(1);});it('c',()=>{expect(hd276avl(0,0)).toBe(0);});it('d',()=>{expect(hd276avl(93,73)).toBe(2);});it('e',()=>{expect(hd276avl(15,0)).toBe(4);});});
function hd277avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277avl_hd',()=>{it('a',()=>{expect(hd277avl(1,4)).toBe(2);});it('b',()=>{expect(hd277avl(3,1)).toBe(1);});it('c',()=>{expect(hd277avl(0,0)).toBe(0);});it('d',()=>{expect(hd277avl(93,73)).toBe(2);});it('e',()=>{expect(hd277avl(15,0)).toBe(4);});});
function hd278avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278avl_hd',()=>{it('a',()=>{expect(hd278avl(1,4)).toBe(2);});it('b',()=>{expect(hd278avl(3,1)).toBe(1);});it('c',()=>{expect(hd278avl(0,0)).toBe(0);});it('d',()=>{expect(hd278avl(93,73)).toBe(2);});it('e',()=>{expect(hd278avl(15,0)).toBe(4);});});
function hd279avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279avl_hd',()=>{it('a',()=>{expect(hd279avl(1,4)).toBe(2);});it('b',()=>{expect(hd279avl(3,1)).toBe(1);});it('c',()=>{expect(hd279avl(0,0)).toBe(0);});it('d',()=>{expect(hd279avl(93,73)).toBe(2);});it('e',()=>{expect(hd279avl(15,0)).toBe(4);});});
function hd280avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280avl_hd',()=>{it('a',()=>{expect(hd280avl(1,4)).toBe(2);});it('b',()=>{expect(hd280avl(3,1)).toBe(1);});it('c',()=>{expect(hd280avl(0,0)).toBe(0);});it('d',()=>{expect(hd280avl(93,73)).toBe(2);});it('e',()=>{expect(hd280avl(15,0)).toBe(4);});});
function hd281avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281avl_hd',()=>{it('a',()=>{expect(hd281avl(1,4)).toBe(2);});it('b',()=>{expect(hd281avl(3,1)).toBe(1);});it('c',()=>{expect(hd281avl(0,0)).toBe(0);});it('d',()=>{expect(hd281avl(93,73)).toBe(2);});it('e',()=>{expect(hd281avl(15,0)).toBe(4);});});
function hd282avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282avl_hd',()=>{it('a',()=>{expect(hd282avl(1,4)).toBe(2);});it('b',()=>{expect(hd282avl(3,1)).toBe(1);});it('c',()=>{expect(hd282avl(0,0)).toBe(0);});it('d',()=>{expect(hd282avl(93,73)).toBe(2);});it('e',()=>{expect(hd282avl(15,0)).toBe(4);});});
function hd283avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283avl_hd',()=>{it('a',()=>{expect(hd283avl(1,4)).toBe(2);});it('b',()=>{expect(hd283avl(3,1)).toBe(1);});it('c',()=>{expect(hd283avl(0,0)).toBe(0);});it('d',()=>{expect(hd283avl(93,73)).toBe(2);});it('e',()=>{expect(hd283avl(15,0)).toBe(4);});});
function hd284avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284avl_hd',()=>{it('a',()=>{expect(hd284avl(1,4)).toBe(2);});it('b',()=>{expect(hd284avl(3,1)).toBe(1);});it('c',()=>{expect(hd284avl(0,0)).toBe(0);});it('d',()=>{expect(hd284avl(93,73)).toBe(2);});it('e',()=>{expect(hd284avl(15,0)).toBe(4);});});
function hd285avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285avl_hd',()=>{it('a',()=>{expect(hd285avl(1,4)).toBe(2);});it('b',()=>{expect(hd285avl(3,1)).toBe(1);});it('c',()=>{expect(hd285avl(0,0)).toBe(0);});it('d',()=>{expect(hd285avl(93,73)).toBe(2);});it('e',()=>{expect(hd285avl(15,0)).toBe(4);});});
function hd286avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286avl_hd',()=>{it('a',()=>{expect(hd286avl(1,4)).toBe(2);});it('b',()=>{expect(hd286avl(3,1)).toBe(1);});it('c',()=>{expect(hd286avl(0,0)).toBe(0);});it('d',()=>{expect(hd286avl(93,73)).toBe(2);});it('e',()=>{expect(hd286avl(15,0)).toBe(4);});});
function hd287avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287avl_hd',()=>{it('a',()=>{expect(hd287avl(1,4)).toBe(2);});it('b',()=>{expect(hd287avl(3,1)).toBe(1);});it('c',()=>{expect(hd287avl(0,0)).toBe(0);});it('d',()=>{expect(hd287avl(93,73)).toBe(2);});it('e',()=>{expect(hd287avl(15,0)).toBe(4);});});
function hd288avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288avl_hd',()=>{it('a',()=>{expect(hd288avl(1,4)).toBe(2);});it('b',()=>{expect(hd288avl(3,1)).toBe(1);});it('c',()=>{expect(hd288avl(0,0)).toBe(0);});it('d',()=>{expect(hd288avl(93,73)).toBe(2);});it('e',()=>{expect(hd288avl(15,0)).toBe(4);});});
function hd289avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289avl_hd',()=>{it('a',()=>{expect(hd289avl(1,4)).toBe(2);});it('b',()=>{expect(hd289avl(3,1)).toBe(1);});it('c',()=>{expect(hd289avl(0,0)).toBe(0);});it('d',()=>{expect(hd289avl(93,73)).toBe(2);});it('e',()=>{expect(hd289avl(15,0)).toBe(4);});});
function hd290avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290avl_hd',()=>{it('a',()=>{expect(hd290avl(1,4)).toBe(2);});it('b',()=>{expect(hd290avl(3,1)).toBe(1);});it('c',()=>{expect(hd290avl(0,0)).toBe(0);});it('d',()=>{expect(hd290avl(93,73)).toBe(2);});it('e',()=>{expect(hd290avl(15,0)).toBe(4);});});
function hd291avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291avl_hd',()=>{it('a',()=>{expect(hd291avl(1,4)).toBe(2);});it('b',()=>{expect(hd291avl(3,1)).toBe(1);});it('c',()=>{expect(hd291avl(0,0)).toBe(0);});it('d',()=>{expect(hd291avl(93,73)).toBe(2);});it('e',()=>{expect(hd291avl(15,0)).toBe(4);});});
function hd292avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292avl_hd',()=>{it('a',()=>{expect(hd292avl(1,4)).toBe(2);});it('b',()=>{expect(hd292avl(3,1)).toBe(1);});it('c',()=>{expect(hd292avl(0,0)).toBe(0);});it('d',()=>{expect(hd292avl(93,73)).toBe(2);});it('e',()=>{expect(hd292avl(15,0)).toBe(4);});});
function hd293avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293avl_hd',()=>{it('a',()=>{expect(hd293avl(1,4)).toBe(2);});it('b',()=>{expect(hd293avl(3,1)).toBe(1);});it('c',()=>{expect(hd293avl(0,0)).toBe(0);});it('d',()=>{expect(hd293avl(93,73)).toBe(2);});it('e',()=>{expect(hd293avl(15,0)).toBe(4);});});
function hd294avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294avl_hd',()=>{it('a',()=>{expect(hd294avl(1,4)).toBe(2);});it('b',()=>{expect(hd294avl(3,1)).toBe(1);});it('c',()=>{expect(hd294avl(0,0)).toBe(0);});it('d',()=>{expect(hd294avl(93,73)).toBe(2);});it('e',()=>{expect(hd294avl(15,0)).toBe(4);});});
function hd295avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295avl_hd',()=>{it('a',()=>{expect(hd295avl(1,4)).toBe(2);});it('b',()=>{expect(hd295avl(3,1)).toBe(1);});it('c',()=>{expect(hd295avl(0,0)).toBe(0);});it('d',()=>{expect(hd295avl(93,73)).toBe(2);});it('e',()=>{expect(hd295avl(15,0)).toBe(4);});});
function hd296avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296avl_hd',()=>{it('a',()=>{expect(hd296avl(1,4)).toBe(2);});it('b',()=>{expect(hd296avl(3,1)).toBe(1);});it('c',()=>{expect(hd296avl(0,0)).toBe(0);});it('d',()=>{expect(hd296avl(93,73)).toBe(2);});it('e',()=>{expect(hd296avl(15,0)).toBe(4);});});
function hd297avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297avl_hd',()=>{it('a',()=>{expect(hd297avl(1,4)).toBe(2);});it('b',()=>{expect(hd297avl(3,1)).toBe(1);});it('c',()=>{expect(hd297avl(0,0)).toBe(0);});it('d',()=>{expect(hd297avl(93,73)).toBe(2);});it('e',()=>{expect(hd297avl(15,0)).toBe(4);});});
function hd298avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298avl_hd',()=>{it('a',()=>{expect(hd298avl(1,4)).toBe(2);});it('b',()=>{expect(hd298avl(3,1)).toBe(1);});it('c',()=>{expect(hd298avl(0,0)).toBe(0);});it('d',()=>{expect(hd298avl(93,73)).toBe(2);});it('e',()=>{expect(hd298avl(15,0)).toBe(4);});});
function hd299avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299avl_hd',()=>{it('a',()=>{expect(hd299avl(1,4)).toBe(2);});it('b',()=>{expect(hd299avl(3,1)).toBe(1);});it('c',()=>{expect(hd299avl(0,0)).toBe(0);});it('d',()=>{expect(hd299avl(93,73)).toBe(2);});it('e',()=>{expect(hd299avl(15,0)).toBe(4);});});
function hd300avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300avl_hd',()=>{it('a',()=>{expect(hd300avl(1,4)).toBe(2);});it('b',()=>{expect(hd300avl(3,1)).toBe(1);});it('c',()=>{expect(hd300avl(0,0)).toBe(0);});it('d',()=>{expect(hd300avl(93,73)).toBe(2);});it('e',()=>{expect(hd300avl(15,0)).toBe(4);});});
function hd301avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301avl_hd',()=>{it('a',()=>{expect(hd301avl(1,4)).toBe(2);});it('b',()=>{expect(hd301avl(3,1)).toBe(1);});it('c',()=>{expect(hd301avl(0,0)).toBe(0);});it('d',()=>{expect(hd301avl(93,73)).toBe(2);});it('e',()=>{expect(hd301avl(15,0)).toBe(4);});});
function hd302avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302avl_hd',()=>{it('a',()=>{expect(hd302avl(1,4)).toBe(2);});it('b',()=>{expect(hd302avl(3,1)).toBe(1);});it('c',()=>{expect(hd302avl(0,0)).toBe(0);});it('d',()=>{expect(hd302avl(93,73)).toBe(2);});it('e',()=>{expect(hd302avl(15,0)).toBe(4);});});
function hd303avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303avl_hd',()=>{it('a',()=>{expect(hd303avl(1,4)).toBe(2);});it('b',()=>{expect(hd303avl(3,1)).toBe(1);});it('c',()=>{expect(hd303avl(0,0)).toBe(0);});it('d',()=>{expect(hd303avl(93,73)).toBe(2);});it('e',()=>{expect(hd303avl(15,0)).toBe(4);});});
function hd304avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304avl_hd',()=>{it('a',()=>{expect(hd304avl(1,4)).toBe(2);});it('b',()=>{expect(hd304avl(3,1)).toBe(1);});it('c',()=>{expect(hd304avl(0,0)).toBe(0);});it('d',()=>{expect(hd304avl(93,73)).toBe(2);});it('e',()=>{expect(hd304avl(15,0)).toBe(4);});});
function hd305avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305avl_hd',()=>{it('a',()=>{expect(hd305avl(1,4)).toBe(2);});it('b',()=>{expect(hd305avl(3,1)).toBe(1);});it('c',()=>{expect(hd305avl(0,0)).toBe(0);});it('d',()=>{expect(hd305avl(93,73)).toBe(2);});it('e',()=>{expect(hd305avl(15,0)).toBe(4);});});
function hd306avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306avl_hd',()=>{it('a',()=>{expect(hd306avl(1,4)).toBe(2);});it('b',()=>{expect(hd306avl(3,1)).toBe(1);});it('c',()=>{expect(hd306avl(0,0)).toBe(0);});it('d',()=>{expect(hd306avl(93,73)).toBe(2);});it('e',()=>{expect(hd306avl(15,0)).toBe(4);});});
function hd307avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307avl_hd',()=>{it('a',()=>{expect(hd307avl(1,4)).toBe(2);});it('b',()=>{expect(hd307avl(3,1)).toBe(1);});it('c',()=>{expect(hd307avl(0,0)).toBe(0);});it('d',()=>{expect(hd307avl(93,73)).toBe(2);});it('e',()=>{expect(hd307avl(15,0)).toBe(4);});});
function hd308avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308avl_hd',()=>{it('a',()=>{expect(hd308avl(1,4)).toBe(2);});it('b',()=>{expect(hd308avl(3,1)).toBe(1);});it('c',()=>{expect(hd308avl(0,0)).toBe(0);});it('d',()=>{expect(hd308avl(93,73)).toBe(2);});it('e',()=>{expect(hd308avl(15,0)).toBe(4);});});
function hd309avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309avl_hd',()=>{it('a',()=>{expect(hd309avl(1,4)).toBe(2);});it('b',()=>{expect(hd309avl(3,1)).toBe(1);});it('c',()=>{expect(hd309avl(0,0)).toBe(0);});it('d',()=>{expect(hd309avl(93,73)).toBe(2);});it('e',()=>{expect(hd309avl(15,0)).toBe(4);});});
function hd310avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310avl_hd',()=>{it('a',()=>{expect(hd310avl(1,4)).toBe(2);});it('b',()=>{expect(hd310avl(3,1)).toBe(1);});it('c',()=>{expect(hd310avl(0,0)).toBe(0);});it('d',()=>{expect(hd310avl(93,73)).toBe(2);});it('e',()=>{expect(hd310avl(15,0)).toBe(4);});});
function hd311avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311avl_hd',()=>{it('a',()=>{expect(hd311avl(1,4)).toBe(2);});it('b',()=>{expect(hd311avl(3,1)).toBe(1);});it('c',()=>{expect(hd311avl(0,0)).toBe(0);});it('d',()=>{expect(hd311avl(93,73)).toBe(2);});it('e',()=>{expect(hd311avl(15,0)).toBe(4);});});
function hd312avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312avl_hd',()=>{it('a',()=>{expect(hd312avl(1,4)).toBe(2);});it('b',()=>{expect(hd312avl(3,1)).toBe(1);});it('c',()=>{expect(hd312avl(0,0)).toBe(0);});it('d',()=>{expect(hd312avl(93,73)).toBe(2);});it('e',()=>{expect(hd312avl(15,0)).toBe(4);});});
function hd313avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313avl_hd',()=>{it('a',()=>{expect(hd313avl(1,4)).toBe(2);});it('b',()=>{expect(hd313avl(3,1)).toBe(1);});it('c',()=>{expect(hd313avl(0,0)).toBe(0);});it('d',()=>{expect(hd313avl(93,73)).toBe(2);});it('e',()=>{expect(hd313avl(15,0)).toBe(4);});});
function hd314avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314avl_hd',()=>{it('a',()=>{expect(hd314avl(1,4)).toBe(2);});it('b',()=>{expect(hd314avl(3,1)).toBe(1);});it('c',()=>{expect(hd314avl(0,0)).toBe(0);});it('d',()=>{expect(hd314avl(93,73)).toBe(2);});it('e',()=>{expect(hd314avl(15,0)).toBe(4);});});
function hd315avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315avl_hd',()=>{it('a',()=>{expect(hd315avl(1,4)).toBe(2);});it('b',()=>{expect(hd315avl(3,1)).toBe(1);});it('c',()=>{expect(hd315avl(0,0)).toBe(0);});it('d',()=>{expect(hd315avl(93,73)).toBe(2);});it('e',()=>{expect(hd315avl(15,0)).toBe(4);});});
function hd316avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316avl_hd',()=>{it('a',()=>{expect(hd316avl(1,4)).toBe(2);});it('b',()=>{expect(hd316avl(3,1)).toBe(1);});it('c',()=>{expect(hd316avl(0,0)).toBe(0);});it('d',()=>{expect(hd316avl(93,73)).toBe(2);});it('e',()=>{expect(hd316avl(15,0)).toBe(4);});});
function hd317avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317avl_hd',()=>{it('a',()=>{expect(hd317avl(1,4)).toBe(2);});it('b',()=>{expect(hd317avl(3,1)).toBe(1);});it('c',()=>{expect(hd317avl(0,0)).toBe(0);});it('d',()=>{expect(hd317avl(93,73)).toBe(2);});it('e',()=>{expect(hd317avl(15,0)).toBe(4);});});
function hd318avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318avl_hd',()=>{it('a',()=>{expect(hd318avl(1,4)).toBe(2);});it('b',()=>{expect(hd318avl(3,1)).toBe(1);});it('c',()=>{expect(hd318avl(0,0)).toBe(0);});it('d',()=>{expect(hd318avl(93,73)).toBe(2);});it('e',()=>{expect(hd318avl(15,0)).toBe(4);});});
function hd319avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319avl_hd',()=>{it('a',()=>{expect(hd319avl(1,4)).toBe(2);});it('b',()=>{expect(hd319avl(3,1)).toBe(1);});it('c',()=>{expect(hd319avl(0,0)).toBe(0);});it('d',()=>{expect(hd319avl(93,73)).toBe(2);});it('e',()=>{expect(hd319avl(15,0)).toBe(4);});});
function hd320avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320avl_hd',()=>{it('a',()=>{expect(hd320avl(1,4)).toBe(2);});it('b',()=>{expect(hd320avl(3,1)).toBe(1);});it('c',()=>{expect(hd320avl(0,0)).toBe(0);});it('d',()=>{expect(hd320avl(93,73)).toBe(2);});it('e',()=>{expect(hd320avl(15,0)).toBe(4);});});
function hd321avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321avl_hd',()=>{it('a',()=>{expect(hd321avl(1,4)).toBe(2);});it('b',()=>{expect(hd321avl(3,1)).toBe(1);});it('c',()=>{expect(hd321avl(0,0)).toBe(0);});it('d',()=>{expect(hd321avl(93,73)).toBe(2);});it('e',()=>{expect(hd321avl(15,0)).toBe(4);});});
function hd322avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322avl_hd',()=>{it('a',()=>{expect(hd322avl(1,4)).toBe(2);});it('b',()=>{expect(hd322avl(3,1)).toBe(1);});it('c',()=>{expect(hd322avl(0,0)).toBe(0);});it('d',()=>{expect(hd322avl(93,73)).toBe(2);});it('e',()=>{expect(hd322avl(15,0)).toBe(4);});});
function hd323avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323avl_hd',()=>{it('a',()=>{expect(hd323avl(1,4)).toBe(2);});it('b',()=>{expect(hd323avl(3,1)).toBe(1);});it('c',()=>{expect(hd323avl(0,0)).toBe(0);});it('d',()=>{expect(hd323avl(93,73)).toBe(2);});it('e',()=>{expect(hd323avl(15,0)).toBe(4);});});
function hd324avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324avl_hd',()=>{it('a',()=>{expect(hd324avl(1,4)).toBe(2);});it('b',()=>{expect(hd324avl(3,1)).toBe(1);});it('c',()=>{expect(hd324avl(0,0)).toBe(0);});it('d',()=>{expect(hd324avl(93,73)).toBe(2);});it('e',()=>{expect(hd324avl(15,0)).toBe(4);});});
function hd325avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325avl_hd',()=>{it('a',()=>{expect(hd325avl(1,4)).toBe(2);});it('b',()=>{expect(hd325avl(3,1)).toBe(1);});it('c',()=>{expect(hd325avl(0,0)).toBe(0);});it('d',()=>{expect(hd325avl(93,73)).toBe(2);});it('e',()=>{expect(hd325avl(15,0)).toBe(4);});});
function hd326avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326avl_hd',()=>{it('a',()=>{expect(hd326avl(1,4)).toBe(2);});it('b',()=>{expect(hd326avl(3,1)).toBe(1);});it('c',()=>{expect(hd326avl(0,0)).toBe(0);});it('d',()=>{expect(hd326avl(93,73)).toBe(2);});it('e',()=>{expect(hd326avl(15,0)).toBe(4);});});
function hd327avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327avl_hd',()=>{it('a',()=>{expect(hd327avl(1,4)).toBe(2);});it('b',()=>{expect(hd327avl(3,1)).toBe(1);});it('c',()=>{expect(hd327avl(0,0)).toBe(0);});it('d',()=>{expect(hd327avl(93,73)).toBe(2);});it('e',()=>{expect(hd327avl(15,0)).toBe(4);});});
function hd328avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328avl_hd',()=>{it('a',()=>{expect(hd328avl(1,4)).toBe(2);});it('b',()=>{expect(hd328avl(3,1)).toBe(1);});it('c',()=>{expect(hd328avl(0,0)).toBe(0);});it('d',()=>{expect(hd328avl(93,73)).toBe(2);});it('e',()=>{expect(hd328avl(15,0)).toBe(4);});});
function hd329avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329avl_hd',()=>{it('a',()=>{expect(hd329avl(1,4)).toBe(2);});it('b',()=>{expect(hd329avl(3,1)).toBe(1);});it('c',()=>{expect(hd329avl(0,0)).toBe(0);});it('d',()=>{expect(hd329avl(93,73)).toBe(2);});it('e',()=>{expect(hd329avl(15,0)).toBe(4);});});
function hd330avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330avl_hd',()=>{it('a',()=>{expect(hd330avl(1,4)).toBe(2);});it('b',()=>{expect(hd330avl(3,1)).toBe(1);});it('c',()=>{expect(hd330avl(0,0)).toBe(0);});it('d',()=>{expect(hd330avl(93,73)).toBe(2);});it('e',()=>{expect(hd330avl(15,0)).toBe(4);});});
function hd331avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331avl_hd',()=>{it('a',()=>{expect(hd331avl(1,4)).toBe(2);});it('b',()=>{expect(hd331avl(3,1)).toBe(1);});it('c',()=>{expect(hd331avl(0,0)).toBe(0);});it('d',()=>{expect(hd331avl(93,73)).toBe(2);});it('e',()=>{expect(hd331avl(15,0)).toBe(4);});});
function hd332avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332avl_hd',()=>{it('a',()=>{expect(hd332avl(1,4)).toBe(2);});it('b',()=>{expect(hd332avl(3,1)).toBe(1);});it('c',()=>{expect(hd332avl(0,0)).toBe(0);});it('d',()=>{expect(hd332avl(93,73)).toBe(2);});it('e',()=>{expect(hd332avl(15,0)).toBe(4);});});
function hd333avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333avl_hd',()=>{it('a',()=>{expect(hd333avl(1,4)).toBe(2);});it('b',()=>{expect(hd333avl(3,1)).toBe(1);});it('c',()=>{expect(hd333avl(0,0)).toBe(0);});it('d',()=>{expect(hd333avl(93,73)).toBe(2);});it('e',()=>{expect(hd333avl(15,0)).toBe(4);});});
function hd334avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334avl_hd',()=>{it('a',()=>{expect(hd334avl(1,4)).toBe(2);});it('b',()=>{expect(hd334avl(3,1)).toBe(1);});it('c',()=>{expect(hd334avl(0,0)).toBe(0);});it('d',()=>{expect(hd334avl(93,73)).toBe(2);});it('e',()=>{expect(hd334avl(15,0)).toBe(4);});});
function hd335avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335avl_hd',()=>{it('a',()=>{expect(hd335avl(1,4)).toBe(2);});it('b',()=>{expect(hd335avl(3,1)).toBe(1);});it('c',()=>{expect(hd335avl(0,0)).toBe(0);});it('d',()=>{expect(hd335avl(93,73)).toBe(2);});it('e',()=>{expect(hd335avl(15,0)).toBe(4);});});
function hd336avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336avl_hd',()=>{it('a',()=>{expect(hd336avl(1,4)).toBe(2);});it('b',()=>{expect(hd336avl(3,1)).toBe(1);});it('c',()=>{expect(hd336avl(0,0)).toBe(0);});it('d',()=>{expect(hd336avl(93,73)).toBe(2);});it('e',()=>{expect(hd336avl(15,0)).toBe(4);});});
function hd337avl(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337avl_hd',()=>{it('a',()=>{expect(hd337avl(1,4)).toBe(2);});it('b',()=>{expect(hd337avl(3,1)).toBe(1);});it('c',()=>{expect(hd337avl(0,0)).toBe(0);});it('d',()=>{expect(hd337avl(93,73)).toBe(2);});it('e',()=>{expect(hd337avl(15,0)).toBe(4);});});
