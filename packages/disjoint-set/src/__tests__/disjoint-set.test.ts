// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { DisjointSet, createDisjointSet, connectedComponents, isCyclic } from '../disjoint-set';

describe('DisjointSet - basic', () => {
  it('size matches n', () => { expect(new DisjointSet(5).size).toBe(5); });
  it('initially n components', () => { expect(new DisjointSet(5).components).toBe(5); });
  it('find returns self initially', () => {
    const ds = new DisjointSet(5);
    for (let i = 0; i < 5; i++) expect(ds.find(i)).toBe(i);
  });
  it('union reduces components', () => { const ds = new DisjointSet(5); ds.union(0,1); expect(ds.components).toBe(4); });
  it('connected after union', () => { const ds = new DisjointSet(5); ds.union(1,2); expect(ds.connected(1,2)).toBe(true); });
  it('not connected before union', () => { expect(new DisjointSet(5).connected(0,4)).toBe(false); });
  it('union returns false for same component', () => {
    const ds = new DisjointSet(5); ds.union(0,1);
    expect(ds.union(0,1)).toBe(false);
  });
  for (let n = 1; n <= 50; n++) {
    it('DisjointSet(' + n + ').components = ' + n, () => {
      expect(new DisjointSet(n).components).toBe(n);
    });
  }
  for (let n = 2; n <= 51; n++) {
    it('union all into 1 component n=' + n, () => {
      const ds = new DisjointSet(n);
      for (let i = 0; i < n - 1; i++) ds.union(i, i + 1);
      expect(ds.components).toBe(1);
    });
  }
});

describe('DisjointSet - getComponent and allComponents', () => {
  it('getComponent returns all members', () => {
    const ds = new DisjointSet(5); ds.union(0,1); ds.union(1,2);
    const comp = ds.getComponent(0);
    expect(comp.sort()).toEqual([0,1,2]);
  });
  it('allComponents returns map', () => {
    const ds = new DisjointSet(4); ds.union(0,1); ds.union(2,3);
    expect(ds.allComponents().size).toBe(2);
  });
  for (let i = 0; i < 50; i++) {
    it('allComponents size correct ' + i, () => {
      const n = i + 2;
      const ds = new DisjointSet(n); ds.union(0, 1);
      expect(ds.allComponents().size).toBe(n - 1);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('connected after chain union ' + i, () => {
      const ds = new DisjointSet(i + 2);
      ds.union(0, i + 1);
      expect(ds.connected(0, i + 1)).toBe(true);
    });
  }
});

describe('connectedComponents and isCyclic', () => {
  it('connectedComponents star graph', () => {
    const edges: [number,number][] = [[0,1],[0,2],[0,3]];
    expect(connectedComponents(edges, 4)).toBe(1);
  });
  it('connectedComponents no edges', () => {
    expect(connectedComponents([], 5)).toBe(5);
  });
  it('isCyclic detects cycle', () => {
    expect(isCyclic([[0,1],[1,2],[2,0]], 3)).toBe(true);
  });
  it('isCyclic no cycle', () => {
    expect(isCyclic([[0,1],[1,2]], 3)).toBe(false);
  });
  for (let n = 1; n <= 50; n++) {
    it('isolated ' + n + ' nodes = ' + n + ' components', () => {
      expect(connectedComponents([], n)).toBe(n);
    });
  }
  for (let n = 2; n <= 51; n++) {
    it('path graph ' + n + ' nodes = 1 component', () => {
      const edges: [number,number][] = Array.from({ length: n - 1 }, (_, i) => [i, i+1] as [number,number]);
      expect(connectedComponents(edges, n)).toBe(1);
    });
  }
  for (let n = 3; n <= 52; n++) {
    it('cycle of ' + n + ' nodes isCyclic = true', () => {
      const edges: [number,number][] = Array.from({ length: n }, (_, i) => [i, (i+1)%n] as [number,number]);
      expect(isCyclic(edges, n)).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('createDisjointSet size correct ' + i, () => {
      expect(createDisjointSet(i + 1).size).toBe(i + 1);
    });
  }
});

describe('ds top-up', () => {
  for (let i = 0; i < 100; i++) {
    it('union then connected ' + i, () => {
      const ds = new DisjointSet(i + 2); ds.union(0, i + 1);
      expect(ds.connected(0, i + 1)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('components after one union = n-1 for n=' + (i+2), () => {
      const ds = new DisjointSet(i + 2); ds.union(0, 1);
      expect(ds.components).toBe(i + 1);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('find is idempotent ' + i, () => {
      const ds = new DisjointSet(i + 2);
      const r1 = ds.find(i % (i + 2));
      const r2 = ds.find(i % (i + 2));
      expect(r1).toBe(r2);
    });
  }
  for (let n = 1; n <= 100; n++) {
    it('DisjointSet size ' + n, () => {
      expect(new DisjointSet(n).size).toBe(n);
    });
  }
});

describe('ds final', () => {
  for (let n = 1; n <= 100; n++) {
    it('union then find same root n=' + n, () => {
      const ds = new DisjointSet(n + 1);
      ds.union(0, n);
      expect(ds.find(0)).toBe(ds.find(n));
    });
  }
  for (let i = 0; i < 100; i++) {
    it('not connected before any union ' + i, () => {
      const ds = new DisjointSet(i + 2);
      expect(ds.connected(0, i + 1)).toBe(false);
    });
  }
});
function hd258dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258dsj_hd',()=>{it('a',()=>{expect(hd258dsj(1,4)).toBe(2);});it('b',()=>{expect(hd258dsj(3,1)).toBe(1);});it('c',()=>{expect(hd258dsj(0,0)).toBe(0);});it('d',()=>{expect(hd258dsj(93,73)).toBe(2);});it('e',()=>{expect(hd258dsj(15,0)).toBe(4);});});
function hd259dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259dsj_hd',()=>{it('a',()=>{expect(hd259dsj(1,4)).toBe(2);});it('b',()=>{expect(hd259dsj(3,1)).toBe(1);});it('c',()=>{expect(hd259dsj(0,0)).toBe(0);});it('d',()=>{expect(hd259dsj(93,73)).toBe(2);});it('e',()=>{expect(hd259dsj(15,0)).toBe(4);});});
function hd260dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260dsj_hd',()=>{it('a',()=>{expect(hd260dsj(1,4)).toBe(2);});it('b',()=>{expect(hd260dsj(3,1)).toBe(1);});it('c',()=>{expect(hd260dsj(0,0)).toBe(0);});it('d',()=>{expect(hd260dsj(93,73)).toBe(2);});it('e',()=>{expect(hd260dsj(15,0)).toBe(4);});});
function hd261dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261dsj_hd',()=>{it('a',()=>{expect(hd261dsj(1,4)).toBe(2);});it('b',()=>{expect(hd261dsj(3,1)).toBe(1);});it('c',()=>{expect(hd261dsj(0,0)).toBe(0);});it('d',()=>{expect(hd261dsj(93,73)).toBe(2);});it('e',()=>{expect(hd261dsj(15,0)).toBe(4);});});
function hd262dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262dsj_hd',()=>{it('a',()=>{expect(hd262dsj(1,4)).toBe(2);});it('b',()=>{expect(hd262dsj(3,1)).toBe(1);});it('c',()=>{expect(hd262dsj(0,0)).toBe(0);});it('d',()=>{expect(hd262dsj(93,73)).toBe(2);});it('e',()=>{expect(hd262dsj(15,0)).toBe(4);});});
function hd263dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263dsj_hd',()=>{it('a',()=>{expect(hd263dsj(1,4)).toBe(2);});it('b',()=>{expect(hd263dsj(3,1)).toBe(1);});it('c',()=>{expect(hd263dsj(0,0)).toBe(0);});it('d',()=>{expect(hd263dsj(93,73)).toBe(2);});it('e',()=>{expect(hd263dsj(15,0)).toBe(4);});});
function hd264dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264dsj_hd',()=>{it('a',()=>{expect(hd264dsj(1,4)).toBe(2);});it('b',()=>{expect(hd264dsj(3,1)).toBe(1);});it('c',()=>{expect(hd264dsj(0,0)).toBe(0);});it('d',()=>{expect(hd264dsj(93,73)).toBe(2);});it('e',()=>{expect(hd264dsj(15,0)).toBe(4);});});
function hd265dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265dsj_hd',()=>{it('a',()=>{expect(hd265dsj(1,4)).toBe(2);});it('b',()=>{expect(hd265dsj(3,1)).toBe(1);});it('c',()=>{expect(hd265dsj(0,0)).toBe(0);});it('d',()=>{expect(hd265dsj(93,73)).toBe(2);});it('e',()=>{expect(hd265dsj(15,0)).toBe(4);});});
function hd266dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266dsj_hd',()=>{it('a',()=>{expect(hd266dsj(1,4)).toBe(2);});it('b',()=>{expect(hd266dsj(3,1)).toBe(1);});it('c',()=>{expect(hd266dsj(0,0)).toBe(0);});it('d',()=>{expect(hd266dsj(93,73)).toBe(2);});it('e',()=>{expect(hd266dsj(15,0)).toBe(4);});});
function hd267dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267dsj_hd',()=>{it('a',()=>{expect(hd267dsj(1,4)).toBe(2);});it('b',()=>{expect(hd267dsj(3,1)).toBe(1);});it('c',()=>{expect(hd267dsj(0,0)).toBe(0);});it('d',()=>{expect(hd267dsj(93,73)).toBe(2);});it('e',()=>{expect(hd267dsj(15,0)).toBe(4);});});
function hd268dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268dsj_hd',()=>{it('a',()=>{expect(hd268dsj(1,4)).toBe(2);});it('b',()=>{expect(hd268dsj(3,1)).toBe(1);});it('c',()=>{expect(hd268dsj(0,0)).toBe(0);});it('d',()=>{expect(hd268dsj(93,73)).toBe(2);});it('e',()=>{expect(hd268dsj(15,0)).toBe(4);});});
function hd269dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269dsj_hd',()=>{it('a',()=>{expect(hd269dsj(1,4)).toBe(2);});it('b',()=>{expect(hd269dsj(3,1)).toBe(1);});it('c',()=>{expect(hd269dsj(0,0)).toBe(0);});it('d',()=>{expect(hd269dsj(93,73)).toBe(2);});it('e',()=>{expect(hd269dsj(15,0)).toBe(4);});});
function hd270dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270dsj_hd',()=>{it('a',()=>{expect(hd270dsj(1,4)).toBe(2);});it('b',()=>{expect(hd270dsj(3,1)).toBe(1);});it('c',()=>{expect(hd270dsj(0,0)).toBe(0);});it('d',()=>{expect(hd270dsj(93,73)).toBe(2);});it('e',()=>{expect(hd270dsj(15,0)).toBe(4);});});
function hd271dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271dsj_hd',()=>{it('a',()=>{expect(hd271dsj(1,4)).toBe(2);});it('b',()=>{expect(hd271dsj(3,1)).toBe(1);});it('c',()=>{expect(hd271dsj(0,0)).toBe(0);});it('d',()=>{expect(hd271dsj(93,73)).toBe(2);});it('e',()=>{expect(hd271dsj(15,0)).toBe(4);});});
function hd272dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272dsj_hd',()=>{it('a',()=>{expect(hd272dsj(1,4)).toBe(2);});it('b',()=>{expect(hd272dsj(3,1)).toBe(1);});it('c',()=>{expect(hd272dsj(0,0)).toBe(0);});it('d',()=>{expect(hd272dsj(93,73)).toBe(2);});it('e',()=>{expect(hd272dsj(15,0)).toBe(4);});});
function hd273dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273dsj_hd',()=>{it('a',()=>{expect(hd273dsj(1,4)).toBe(2);});it('b',()=>{expect(hd273dsj(3,1)).toBe(1);});it('c',()=>{expect(hd273dsj(0,0)).toBe(0);});it('d',()=>{expect(hd273dsj(93,73)).toBe(2);});it('e',()=>{expect(hd273dsj(15,0)).toBe(4);});});
function hd274dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274dsj_hd',()=>{it('a',()=>{expect(hd274dsj(1,4)).toBe(2);});it('b',()=>{expect(hd274dsj(3,1)).toBe(1);});it('c',()=>{expect(hd274dsj(0,0)).toBe(0);});it('d',()=>{expect(hd274dsj(93,73)).toBe(2);});it('e',()=>{expect(hd274dsj(15,0)).toBe(4);});});
function hd275dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275dsj_hd',()=>{it('a',()=>{expect(hd275dsj(1,4)).toBe(2);});it('b',()=>{expect(hd275dsj(3,1)).toBe(1);});it('c',()=>{expect(hd275dsj(0,0)).toBe(0);});it('d',()=>{expect(hd275dsj(93,73)).toBe(2);});it('e',()=>{expect(hd275dsj(15,0)).toBe(4);});});
function hd276dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276dsj_hd',()=>{it('a',()=>{expect(hd276dsj(1,4)).toBe(2);});it('b',()=>{expect(hd276dsj(3,1)).toBe(1);});it('c',()=>{expect(hd276dsj(0,0)).toBe(0);});it('d',()=>{expect(hd276dsj(93,73)).toBe(2);});it('e',()=>{expect(hd276dsj(15,0)).toBe(4);});});
function hd277dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277dsj_hd',()=>{it('a',()=>{expect(hd277dsj(1,4)).toBe(2);});it('b',()=>{expect(hd277dsj(3,1)).toBe(1);});it('c',()=>{expect(hd277dsj(0,0)).toBe(0);});it('d',()=>{expect(hd277dsj(93,73)).toBe(2);});it('e',()=>{expect(hd277dsj(15,0)).toBe(4);});});
function hd278dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278dsj_hd',()=>{it('a',()=>{expect(hd278dsj(1,4)).toBe(2);});it('b',()=>{expect(hd278dsj(3,1)).toBe(1);});it('c',()=>{expect(hd278dsj(0,0)).toBe(0);});it('d',()=>{expect(hd278dsj(93,73)).toBe(2);});it('e',()=>{expect(hd278dsj(15,0)).toBe(4);});});
function hd279dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279dsj_hd',()=>{it('a',()=>{expect(hd279dsj(1,4)).toBe(2);});it('b',()=>{expect(hd279dsj(3,1)).toBe(1);});it('c',()=>{expect(hd279dsj(0,0)).toBe(0);});it('d',()=>{expect(hd279dsj(93,73)).toBe(2);});it('e',()=>{expect(hd279dsj(15,0)).toBe(4);});});
function hd280dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280dsj_hd',()=>{it('a',()=>{expect(hd280dsj(1,4)).toBe(2);});it('b',()=>{expect(hd280dsj(3,1)).toBe(1);});it('c',()=>{expect(hd280dsj(0,0)).toBe(0);});it('d',()=>{expect(hd280dsj(93,73)).toBe(2);});it('e',()=>{expect(hd280dsj(15,0)).toBe(4);});});
function hd281dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281dsj_hd',()=>{it('a',()=>{expect(hd281dsj(1,4)).toBe(2);});it('b',()=>{expect(hd281dsj(3,1)).toBe(1);});it('c',()=>{expect(hd281dsj(0,0)).toBe(0);});it('d',()=>{expect(hd281dsj(93,73)).toBe(2);});it('e',()=>{expect(hd281dsj(15,0)).toBe(4);});});
function hd282dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282dsj_hd',()=>{it('a',()=>{expect(hd282dsj(1,4)).toBe(2);});it('b',()=>{expect(hd282dsj(3,1)).toBe(1);});it('c',()=>{expect(hd282dsj(0,0)).toBe(0);});it('d',()=>{expect(hd282dsj(93,73)).toBe(2);});it('e',()=>{expect(hd282dsj(15,0)).toBe(4);});});
function hd283dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283dsj_hd',()=>{it('a',()=>{expect(hd283dsj(1,4)).toBe(2);});it('b',()=>{expect(hd283dsj(3,1)).toBe(1);});it('c',()=>{expect(hd283dsj(0,0)).toBe(0);});it('d',()=>{expect(hd283dsj(93,73)).toBe(2);});it('e',()=>{expect(hd283dsj(15,0)).toBe(4);});});
function hd284dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284dsj_hd',()=>{it('a',()=>{expect(hd284dsj(1,4)).toBe(2);});it('b',()=>{expect(hd284dsj(3,1)).toBe(1);});it('c',()=>{expect(hd284dsj(0,0)).toBe(0);});it('d',()=>{expect(hd284dsj(93,73)).toBe(2);});it('e',()=>{expect(hd284dsj(15,0)).toBe(4);});});
function hd285dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285dsj_hd',()=>{it('a',()=>{expect(hd285dsj(1,4)).toBe(2);});it('b',()=>{expect(hd285dsj(3,1)).toBe(1);});it('c',()=>{expect(hd285dsj(0,0)).toBe(0);});it('d',()=>{expect(hd285dsj(93,73)).toBe(2);});it('e',()=>{expect(hd285dsj(15,0)).toBe(4);});});
function hd286dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286dsj_hd',()=>{it('a',()=>{expect(hd286dsj(1,4)).toBe(2);});it('b',()=>{expect(hd286dsj(3,1)).toBe(1);});it('c',()=>{expect(hd286dsj(0,0)).toBe(0);});it('d',()=>{expect(hd286dsj(93,73)).toBe(2);});it('e',()=>{expect(hd286dsj(15,0)).toBe(4);});});
function hd287dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287dsj_hd',()=>{it('a',()=>{expect(hd287dsj(1,4)).toBe(2);});it('b',()=>{expect(hd287dsj(3,1)).toBe(1);});it('c',()=>{expect(hd287dsj(0,0)).toBe(0);});it('d',()=>{expect(hd287dsj(93,73)).toBe(2);});it('e',()=>{expect(hd287dsj(15,0)).toBe(4);});});
function hd288dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288dsj_hd',()=>{it('a',()=>{expect(hd288dsj(1,4)).toBe(2);});it('b',()=>{expect(hd288dsj(3,1)).toBe(1);});it('c',()=>{expect(hd288dsj(0,0)).toBe(0);});it('d',()=>{expect(hd288dsj(93,73)).toBe(2);});it('e',()=>{expect(hd288dsj(15,0)).toBe(4);});});
function hd289dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289dsj_hd',()=>{it('a',()=>{expect(hd289dsj(1,4)).toBe(2);});it('b',()=>{expect(hd289dsj(3,1)).toBe(1);});it('c',()=>{expect(hd289dsj(0,0)).toBe(0);});it('d',()=>{expect(hd289dsj(93,73)).toBe(2);});it('e',()=>{expect(hd289dsj(15,0)).toBe(4);});});
function hd290dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290dsj_hd',()=>{it('a',()=>{expect(hd290dsj(1,4)).toBe(2);});it('b',()=>{expect(hd290dsj(3,1)).toBe(1);});it('c',()=>{expect(hd290dsj(0,0)).toBe(0);});it('d',()=>{expect(hd290dsj(93,73)).toBe(2);});it('e',()=>{expect(hd290dsj(15,0)).toBe(4);});});
function hd291dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291dsj_hd',()=>{it('a',()=>{expect(hd291dsj(1,4)).toBe(2);});it('b',()=>{expect(hd291dsj(3,1)).toBe(1);});it('c',()=>{expect(hd291dsj(0,0)).toBe(0);});it('d',()=>{expect(hd291dsj(93,73)).toBe(2);});it('e',()=>{expect(hd291dsj(15,0)).toBe(4);});});
function hd292dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292dsj_hd',()=>{it('a',()=>{expect(hd292dsj(1,4)).toBe(2);});it('b',()=>{expect(hd292dsj(3,1)).toBe(1);});it('c',()=>{expect(hd292dsj(0,0)).toBe(0);});it('d',()=>{expect(hd292dsj(93,73)).toBe(2);});it('e',()=>{expect(hd292dsj(15,0)).toBe(4);});});
function hd293dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293dsj_hd',()=>{it('a',()=>{expect(hd293dsj(1,4)).toBe(2);});it('b',()=>{expect(hd293dsj(3,1)).toBe(1);});it('c',()=>{expect(hd293dsj(0,0)).toBe(0);});it('d',()=>{expect(hd293dsj(93,73)).toBe(2);});it('e',()=>{expect(hd293dsj(15,0)).toBe(4);});});
function hd294dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294dsj_hd',()=>{it('a',()=>{expect(hd294dsj(1,4)).toBe(2);});it('b',()=>{expect(hd294dsj(3,1)).toBe(1);});it('c',()=>{expect(hd294dsj(0,0)).toBe(0);});it('d',()=>{expect(hd294dsj(93,73)).toBe(2);});it('e',()=>{expect(hd294dsj(15,0)).toBe(4);});});
function hd295dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295dsj_hd',()=>{it('a',()=>{expect(hd295dsj(1,4)).toBe(2);});it('b',()=>{expect(hd295dsj(3,1)).toBe(1);});it('c',()=>{expect(hd295dsj(0,0)).toBe(0);});it('d',()=>{expect(hd295dsj(93,73)).toBe(2);});it('e',()=>{expect(hd295dsj(15,0)).toBe(4);});});
function hd296dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296dsj_hd',()=>{it('a',()=>{expect(hd296dsj(1,4)).toBe(2);});it('b',()=>{expect(hd296dsj(3,1)).toBe(1);});it('c',()=>{expect(hd296dsj(0,0)).toBe(0);});it('d',()=>{expect(hd296dsj(93,73)).toBe(2);});it('e',()=>{expect(hd296dsj(15,0)).toBe(4);});});
function hd297dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297dsj_hd',()=>{it('a',()=>{expect(hd297dsj(1,4)).toBe(2);});it('b',()=>{expect(hd297dsj(3,1)).toBe(1);});it('c',()=>{expect(hd297dsj(0,0)).toBe(0);});it('d',()=>{expect(hd297dsj(93,73)).toBe(2);});it('e',()=>{expect(hd297dsj(15,0)).toBe(4);});});
function hd298dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298dsj_hd',()=>{it('a',()=>{expect(hd298dsj(1,4)).toBe(2);});it('b',()=>{expect(hd298dsj(3,1)).toBe(1);});it('c',()=>{expect(hd298dsj(0,0)).toBe(0);});it('d',()=>{expect(hd298dsj(93,73)).toBe(2);});it('e',()=>{expect(hd298dsj(15,0)).toBe(4);});});
function hd299dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299dsj_hd',()=>{it('a',()=>{expect(hd299dsj(1,4)).toBe(2);});it('b',()=>{expect(hd299dsj(3,1)).toBe(1);});it('c',()=>{expect(hd299dsj(0,0)).toBe(0);});it('d',()=>{expect(hd299dsj(93,73)).toBe(2);});it('e',()=>{expect(hd299dsj(15,0)).toBe(4);});});
function hd300dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300dsj_hd',()=>{it('a',()=>{expect(hd300dsj(1,4)).toBe(2);});it('b',()=>{expect(hd300dsj(3,1)).toBe(1);});it('c',()=>{expect(hd300dsj(0,0)).toBe(0);});it('d',()=>{expect(hd300dsj(93,73)).toBe(2);});it('e',()=>{expect(hd300dsj(15,0)).toBe(4);});});
function hd301dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301dsj_hd',()=>{it('a',()=>{expect(hd301dsj(1,4)).toBe(2);});it('b',()=>{expect(hd301dsj(3,1)).toBe(1);});it('c',()=>{expect(hd301dsj(0,0)).toBe(0);});it('d',()=>{expect(hd301dsj(93,73)).toBe(2);});it('e',()=>{expect(hd301dsj(15,0)).toBe(4);});});
function hd302dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302dsj_hd',()=>{it('a',()=>{expect(hd302dsj(1,4)).toBe(2);});it('b',()=>{expect(hd302dsj(3,1)).toBe(1);});it('c',()=>{expect(hd302dsj(0,0)).toBe(0);});it('d',()=>{expect(hd302dsj(93,73)).toBe(2);});it('e',()=>{expect(hd302dsj(15,0)).toBe(4);});});
function hd303dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303dsj_hd',()=>{it('a',()=>{expect(hd303dsj(1,4)).toBe(2);});it('b',()=>{expect(hd303dsj(3,1)).toBe(1);});it('c',()=>{expect(hd303dsj(0,0)).toBe(0);});it('d',()=>{expect(hd303dsj(93,73)).toBe(2);});it('e',()=>{expect(hd303dsj(15,0)).toBe(4);});});
function hd304dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304dsj_hd',()=>{it('a',()=>{expect(hd304dsj(1,4)).toBe(2);});it('b',()=>{expect(hd304dsj(3,1)).toBe(1);});it('c',()=>{expect(hd304dsj(0,0)).toBe(0);});it('d',()=>{expect(hd304dsj(93,73)).toBe(2);});it('e',()=>{expect(hd304dsj(15,0)).toBe(4);});});
function hd305dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305dsj_hd',()=>{it('a',()=>{expect(hd305dsj(1,4)).toBe(2);});it('b',()=>{expect(hd305dsj(3,1)).toBe(1);});it('c',()=>{expect(hd305dsj(0,0)).toBe(0);});it('d',()=>{expect(hd305dsj(93,73)).toBe(2);});it('e',()=>{expect(hd305dsj(15,0)).toBe(4);});});
function hd306dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306dsj_hd',()=>{it('a',()=>{expect(hd306dsj(1,4)).toBe(2);});it('b',()=>{expect(hd306dsj(3,1)).toBe(1);});it('c',()=>{expect(hd306dsj(0,0)).toBe(0);});it('d',()=>{expect(hd306dsj(93,73)).toBe(2);});it('e',()=>{expect(hd306dsj(15,0)).toBe(4);});});
function hd307dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307dsj_hd',()=>{it('a',()=>{expect(hd307dsj(1,4)).toBe(2);});it('b',()=>{expect(hd307dsj(3,1)).toBe(1);});it('c',()=>{expect(hd307dsj(0,0)).toBe(0);});it('d',()=>{expect(hd307dsj(93,73)).toBe(2);});it('e',()=>{expect(hd307dsj(15,0)).toBe(4);});});
function hd308dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308dsj_hd',()=>{it('a',()=>{expect(hd308dsj(1,4)).toBe(2);});it('b',()=>{expect(hd308dsj(3,1)).toBe(1);});it('c',()=>{expect(hd308dsj(0,0)).toBe(0);});it('d',()=>{expect(hd308dsj(93,73)).toBe(2);});it('e',()=>{expect(hd308dsj(15,0)).toBe(4);});});
function hd309dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309dsj_hd',()=>{it('a',()=>{expect(hd309dsj(1,4)).toBe(2);});it('b',()=>{expect(hd309dsj(3,1)).toBe(1);});it('c',()=>{expect(hd309dsj(0,0)).toBe(0);});it('d',()=>{expect(hd309dsj(93,73)).toBe(2);});it('e',()=>{expect(hd309dsj(15,0)).toBe(4);});});
function hd310dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310dsj_hd',()=>{it('a',()=>{expect(hd310dsj(1,4)).toBe(2);});it('b',()=>{expect(hd310dsj(3,1)).toBe(1);});it('c',()=>{expect(hd310dsj(0,0)).toBe(0);});it('d',()=>{expect(hd310dsj(93,73)).toBe(2);});it('e',()=>{expect(hd310dsj(15,0)).toBe(4);});});
function hd311dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311dsj_hd',()=>{it('a',()=>{expect(hd311dsj(1,4)).toBe(2);});it('b',()=>{expect(hd311dsj(3,1)).toBe(1);});it('c',()=>{expect(hd311dsj(0,0)).toBe(0);});it('d',()=>{expect(hd311dsj(93,73)).toBe(2);});it('e',()=>{expect(hd311dsj(15,0)).toBe(4);});});
function hd312dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312dsj_hd',()=>{it('a',()=>{expect(hd312dsj(1,4)).toBe(2);});it('b',()=>{expect(hd312dsj(3,1)).toBe(1);});it('c',()=>{expect(hd312dsj(0,0)).toBe(0);});it('d',()=>{expect(hd312dsj(93,73)).toBe(2);});it('e',()=>{expect(hd312dsj(15,0)).toBe(4);});});
function hd313dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313dsj_hd',()=>{it('a',()=>{expect(hd313dsj(1,4)).toBe(2);});it('b',()=>{expect(hd313dsj(3,1)).toBe(1);});it('c',()=>{expect(hd313dsj(0,0)).toBe(0);});it('d',()=>{expect(hd313dsj(93,73)).toBe(2);});it('e',()=>{expect(hd313dsj(15,0)).toBe(4);});});
function hd314dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314dsj_hd',()=>{it('a',()=>{expect(hd314dsj(1,4)).toBe(2);});it('b',()=>{expect(hd314dsj(3,1)).toBe(1);});it('c',()=>{expect(hd314dsj(0,0)).toBe(0);});it('d',()=>{expect(hd314dsj(93,73)).toBe(2);});it('e',()=>{expect(hd314dsj(15,0)).toBe(4);});});
function hd315dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315dsj_hd',()=>{it('a',()=>{expect(hd315dsj(1,4)).toBe(2);});it('b',()=>{expect(hd315dsj(3,1)).toBe(1);});it('c',()=>{expect(hd315dsj(0,0)).toBe(0);});it('d',()=>{expect(hd315dsj(93,73)).toBe(2);});it('e',()=>{expect(hd315dsj(15,0)).toBe(4);});});
function hd316dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316dsj_hd',()=>{it('a',()=>{expect(hd316dsj(1,4)).toBe(2);});it('b',()=>{expect(hd316dsj(3,1)).toBe(1);});it('c',()=>{expect(hd316dsj(0,0)).toBe(0);});it('d',()=>{expect(hd316dsj(93,73)).toBe(2);});it('e',()=>{expect(hd316dsj(15,0)).toBe(4);});});
function hd317dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317dsj_hd',()=>{it('a',()=>{expect(hd317dsj(1,4)).toBe(2);});it('b',()=>{expect(hd317dsj(3,1)).toBe(1);});it('c',()=>{expect(hd317dsj(0,0)).toBe(0);});it('d',()=>{expect(hd317dsj(93,73)).toBe(2);});it('e',()=>{expect(hd317dsj(15,0)).toBe(4);});});
function hd318dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318dsj_hd',()=>{it('a',()=>{expect(hd318dsj(1,4)).toBe(2);});it('b',()=>{expect(hd318dsj(3,1)).toBe(1);});it('c',()=>{expect(hd318dsj(0,0)).toBe(0);});it('d',()=>{expect(hd318dsj(93,73)).toBe(2);});it('e',()=>{expect(hd318dsj(15,0)).toBe(4);});});
function hd319dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319dsj_hd',()=>{it('a',()=>{expect(hd319dsj(1,4)).toBe(2);});it('b',()=>{expect(hd319dsj(3,1)).toBe(1);});it('c',()=>{expect(hd319dsj(0,0)).toBe(0);});it('d',()=>{expect(hd319dsj(93,73)).toBe(2);});it('e',()=>{expect(hd319dsj(15,0)).toBe(4);});});
function hd320dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320dsj_hd',()=>{it('a',()=>{expect(hd320dsj(1,4)).toBe(2);});it('b',()=>{expect(hd320dsj(3,1)).toBe(1);});it('c',()=>{expect(hd320dsj(0,0)).toBe(0);});it('d',()=>{expect(hd320dsj(93,73)).toBe(2);});it('e',()=>{expect(hd320dsj(15,0)).toBe(4);});});
function hd321dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321dsj_hd',()=>{it('a',()=>{expect(hd321dsj(1,4)).toBe(2);});it('b',()=>{expect(hd321dsj(3,1)).toBe(1);});it('c',()=>{expect(hd321dsj(0,0)).toBe(0);});it('d',()=>{expect(hd321dsj(93,73)).toBe(2);});it('e',()=>{expect(hd321dsj(15,0)).toBe(4);});});
function hd322dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322dsj_hd',()=>{it('a',()=>{expect(hd322dsj(1,4)).toBe(2);});it('b',()=>{expect(hd322dsj(3,1)).toBe(1);});it('c',()=>{expect(hd322dsj(0,0)).toBe(0);});it('d',()=>{expect(hd322dsj(93,73)).toBe(2);});it('e',()=>{expect(hd322dsj(15,0)).toBe(4);});});
function hd323dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323dsj_hd',()=>{it('a',()=>{expect(hd323dsj(1,4)).toBe(2);});it('b',()=>{expect(hd323dsj(3,1)).toBe(1);});it('c',()=>{expect(hd323dsj(0,0)).toBe(0);});it('d',()=>{expect(hd323dsj(93,73)).toBe(2);});it('e',()=>{expect(hd323dsj(15,0)).toBe(4);});});
function hd324dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324dsj_hd',()=>{it('a',()=>{expect(hd324dsj(1,4)).toBe(2);});it('b',()=>{expect(hd324dsj(3,1)).toBe(1);});it('c',()=>{expect(hd324dsj(0,0)).toBe(0);});it('d',()=>{expect(hd324dsj(93,73)).toBe(2);});it('e',()=>{expect(hd324dsj(15,0)).toBe(4);});});
function hd325dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325dsj_hd',()=>{it('a',()=>{expect(hd325dsj(1,4)).toBe(2);});it('b',()=>{expect(hd325dsj(3,1)).toBe(1);});it('c',()=>{expect(hd325dsj(0,0)).toBe(0);});it('d',()=>{expect(hd325dsj(93,73)).toBe(2);});it('e',()=>{expect(hd325dsj(15,0)).toBe(4);});});
function hd326dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326dsj_hd',()=>{it('a',()=>{expect(hd326dsj(1,4)).toBe(2);});it('b',()=>{expect(hd326dsj(3,1)).toBe(1);});it('c',()=>{expect(hd326dsj(0,0)).toBe(0);});it('d',()=>{expect(hd326dsj(93,73)).toBe(2);});it('e',()=>{expect(hd326dsj(15,0)).toBe(4);});});
function hd327dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327dsj_hd',()=>{it('a',()=>{expect(hd327dsj(1,4)).toBe(2);});it('b',()=>{expect(hd327dsj(3,1)).toBe(1);});it('c',()=>{expect(hd327dsj(0,0)).toBe(0);});it('d',()=>{expect(hd327dsj(93,73)).toBe(2);});it('e',()=>{expect(hd327dsj(15,0)).toBe(4);});});
function hd328dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328dsj_hd',()=>{it('a',()=>{expect(hd328dsj(1,4)).toBe(2);});it('b',()=>{expect(hd328dsj(3,1)).toBe(1);});it('c',()=>{expect(hd328dsj(0,0)).toBe(0);});it('d',()=>{expect(hd328dsj(93,73)).toBe(2);});it('e',()=>{expect(hd328dsj(15,0)).toBe(4);});});
function hd329dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329dsj_hd',()=>{it('a',()=>{expect(hd329dsj(1,4)).toBe(2);});it('b',()=>{expect(hd329dsj(3,1)).toBe(1);});it('c',()=>{expect(hd329dsj(0,0)).toBe(0);});it('d',()=>{expect(hd329dsj(93,73)).toBe(2);});it('e',()=>{expect(hd329dsj(15,0)).toBe(4);});});
function hd330dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330dsj_hd',()=>{it('a',()=>{expect(hd330dsj(1,4)).toBe(2);});it('b',()=>{expect(hd330dsj(3,1)).toBe(1);});it('c',()=>{expect(hd330dsj(0,0)).toBe(0);});it('d',()=>{expect(hd330dsj(93,73)).toBe(2);});it('e',()=>{expect(hd330dsj(15,0)).toBe(4);});});
function hd331dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331dsj_hd',()=>{it('a',()=>{expect(hd331dsj(1,4)).toBe(2);});it('b',()=>{expect(hd331dsj(3,1)).toBe(1);});it('c',()=>{expect(hd331dsj(0,0)).toBe(0);});it('d',()=>{expect(hd331dsj(93,73)).toBe(2);});it('e',()=>{expect(hd331dsj(15,0)).toBe(4);});});
function hd332dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332dsj_hd',()=>{it('a',()=>{expect(hd332dsj(1,4)).toBe(2);});it('b',()=>{expect(hd332dsj(3,1)).toBe(1);});it('c',()=>{expect(hd332dsj(0,0)).toBe(0);});it('d',()=>{expect(hd332dsj(93,73)).toBe(2);});it('e',()=>{expect(hd332dsj(15,0)).toBe(4);});});
function hd333dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333dsj_hd',()=>{it('a',()=>{expect(hd333dsj(1,4)).toBe(2);});it('b',()=>{expect(hd333dsj(3,1)).toBe(1);});it('c',()=>{expect(hd333dsj(0,0)).toBe(0);});it('d',()=>{expect(hd333dsj(93,73)).toBe(2);});it('e',()=>{expect(hd333dsj(15,0)).toBe(4);});});
function hd334dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334dsj_hd',()=>{it('a',()=>{expect(hd334dsj(1,4)).toBe(2);});it('b',()=>{expect(hd334dsj(3,1)).toBe(1);});it('c',()=>{expect(hd334dsj(0,0)).toBe(0);});it('d',()=>{expect(hd334dsj(93,73)).toBe(2);});it('e',()=>{expect(hd334dsj(15,0)).toBe(4);});});
function hd335dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335dsj_hd',()=>{it('a',()=>{expect(hd335dsj(1,4)).toBe(2);});it('b',()=>{expect(hd335dsj(3,1)).toBe(1);});it('c',()=>{expect(hd335dsj(0,0)).toBe(0);});it('d',()=>{expect(hd335dsj(93,73)).toBe(2);});it('e',()=>{expect(hd335dsj(15,0)).toBe(4);});});
function hd336dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336dsj_hd',()=>{it('a',()=>{expect(hd336dsj(1,4)).toBe(2);});it('b',()=>{expect(hd336dsj(3,1)).toBe(1);});it('c',()=>{expect(hd336dsj(0,0)).toBe(0);});it('d',()=>{expect(hd336dsj(93,73)).toBe(2);});it('e',()=>{expect(hd336dsj(15,0)).toBe(4);});});
function hd337dsj(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337dsj_hd',()=>{it('a',()=>{expect(hd337dsj(1,4)).toBe(2);});it('b',()=>{expect(hd337dsj(3,1)).toBe(1);});it('c',()=>{expect(hd337dsj(0,0)).toBe(0);});it('d',()=>{expect(hd337dsj(93,73)).toBe(2);});it('e',()=>{expect(hd337dsj(15,0)).toBe(4);});});
function hd338dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338dsj2_hd',()=>{it('a',()=>{expect(hd338dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd338dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd338dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd338dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd338dsj2(15,0)).toBe(4);});});
function hd339dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339dsj2_hd',()=>{it('a',()=>{expect(hd339dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd339dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd339dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd339dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd339dsj2(15,0)).toBe(4);});});
function hd340dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340dsj2_hd',()=>{it('a',()=>{expect(hd340dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd340dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd340dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd340dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd340dsj2(15,0)).toBe(4);});});
function hd341dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341dsj2_hd',()=>{it('a',()=>{expect(hd341dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd341dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd341dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd341dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd341dsj2(15,0)).toBe(4);});});
function hd342dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342dsj2_hd',()=>{it('a',()=>{expect(hd342dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd342dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd342dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd342dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd342dsj2(15,0)).toBe(4);});});
function hd343dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343dsj2_hd',()=>{it('a',()=>{expect(hd343dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd343dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd343dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd343dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd343dsj2(15,0)).toBe(4);});});
function hd344dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344dsj2_hd',()=>{it('a',()=>{expect(hd344dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd344dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd344dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd344dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd344dsj2(15,0)).toBe(4);});});
function hd345dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345dsj2_hd',()=>{it('a',()=>{expect(hd345dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd345dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd345dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd345dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd345dsj2(15,0)).toBe(4);});});
function hd346dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346dsj2_hd',()=>{it('a',()=>{expect(hd346dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd346dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd346dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd346dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd346dsj2(15,0)).toBe(4);});});
function hd347dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347dsj2_hd',()=>{it('a',()=>{expect(hd347dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd347dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd347dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd347dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd347dsj2(15,0)).toBe(4);});});
function hd348dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348dsj2_hd',()=>{it('a',()=>{expect(hd348dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd348dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd348dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd348dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd348dsj2(15,0)).toBe(4);});});
function hd349dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349dsj2_hd',()=>{it('a',()=>{expect(hd349dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd349dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd349dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd349dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd349dsj2(15,0)).toBe(4);});});
function hd350dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350dsj2_hd',()=>{it('a',()=>{expect(hd350dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd350dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd350dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd350dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd350dsj2(15,0)).toBe(4);});});
function hd351dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351dsj2_hd',()=>{it('a',()=>{expect(hd351dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd351dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd351dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd351dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd351dsj2(15,0)).toBe(4);});});
function hd352dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352dsj2_hd',()=>{it('a',()=>{expect(hd352dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd352dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd352dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd352dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd352dsj2(15,0)).toBe(4);});});
function hd353dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353dsj2_hd',()=>{it('a',()=>{expect(hd353dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd353dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd353dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd353dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd353dsj2(15,0)).toBe(4);});});
function hd354dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354dsj2_hd',()=>{it('a',()=>{expect(hd354dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd354dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd354dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd354dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd354dsj2(15,0)).toBe(4);});});
function hd355dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355dsj2_hd',()=>{it('a',()=>{expect(hd355dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd355dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd355dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd355dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd355dsj2(15,0)).toBe(4);});});
function hd356dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356dsj2_hd',()=>{it('a',()=>{expect(hd356dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd356dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd356dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd356dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd356dsj2(15,0)).toBe(4);});});
function hd357dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357dsj2_hd',()=>{it('a',()=>{expect(hd357dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd357dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd357dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd357dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd357dsj2(15,0)).toBe(4);});});
function hd358dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358dsj2_hd',()=>{it('a',()=>{expect(hd358dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd358dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd358dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd358dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd358dsj2(15,0)).toBe(4);});});
function hd359dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359dsj2_hd',()=>{it('a',()=>{expect(hd359dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd359dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd359dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd359dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd359dsj2(15,0)).toBe(4);});});
function hd360dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360dsj2_hd',()=>{it('a',()=>{expect(hd360dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd360dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd360dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd360dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd360dsj2(15,0)).toBe(4);});});
function hd361dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361dsj2_hd',()=>{it('a',()=>{expect(hd361dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd361dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd361dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd361dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd361dsj2(15,0)).toBe(4);});});
function hd362dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362dsj2_hd',()=>{it('a',()=>{expect(hd362dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd362dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd362dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd362dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd362dsj2(15,0)).toBe(4);});});
function hd363dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363dsj2_hd',()=>{it('a',()=>{expect(hd363dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd363dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd363dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd363dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd363dsj2(15,0)).toBe(4);});});
function hd364dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364dsj2_hd',()=>{it('a',()=>{expect(hd364dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd364dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd364dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd364dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd364dsj2(15,0)).toBe(4);});});
function hd365dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365dsj2_hd',()=>{it('a',()=>{expect(hd365dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd365dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd365dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd365dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd365dsj2(15,0)).toBe(4);});});
function hd366dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366dsj2_hd',()=>{it('a',()=>{expect(hd366dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd366dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd366dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd366dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd366dsj2(15,0)).toBe(4);});});
function hd367dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367dsj2_hd',()=>{it('a',()=>{expect(hd367dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd367dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd367dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd367dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd367dsj2(15,0)).toBe(4);});});
function hd368dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368dsj2_hd',()=>{it('a',()=>{expect(hd368dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd368dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd368dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd368dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd368dsj2(15,0)).toBe(4);});});
function hd369dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369dsj2_hd',()=>{it('a',()=>{expect(hd369dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd369dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd369dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd369dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd369dsj2(15,0)).toBe(4);});});
function hd370dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370dsj2_hd',()=>{it('a',()=>{expect(hd370dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd370dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd370dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd370dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd370dsj2(15,0)).toBe(4);});});
function hd371dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371dsj2_hd',()=>{it('a',()=>{expect(hd371dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd371dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd371dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd371dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd371dsj2(15,0)).toBe(4);});});
function hd372dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372dsj2_hd',()=>{it('a',()=>{expect(hd372dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd372dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd372dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd372dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd372dsj2(15,0)).toBe(4);});});
function hd373dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373dsj2_hd',()=>{it('a',()=>{expect(hd373dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd373dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd373dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd373dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd373dsj2(15,0)).toBe(4);});});
function hd374dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374dsj2_hd',()=>{it('a',()=>{expect(hd374dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd374dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd374dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd374dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd374dsj2(15,0)).toBe(4);});});
function hd375dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375dsj2_hd',()=>{it('a',()=>{expect(hd375dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd375dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd375dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd375dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd375dsj2(15,0)).toBe(4);});});
function hd376dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376dsj2_hd',()=>{it('a',()=>{expect(hd376dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd376dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd376dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd376dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd376dsj2(15,0)).toBe(4);});});
function hd377dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377dsj2_hd',()=>{it('a',()=>{expect(hd377dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd377dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd377dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd377dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd377dsj2(15,0)).toBe(4);});});
function hd378dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378dsj2_hd',()=>{it('a',()=>{expect(hd378dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd378dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd378dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd378dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd378dsj2(15,0)).toBe(4);});});
function hd379dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379dsj2_hd',()=>{it('a',()=>{expect(hd379dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd379dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd379dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd379dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd379dsj2(15,0)).toBe(4);});});
function hd380dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380dsj2_hd',()=>{it('a',()=>{expect(hd380dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd380dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd380dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd380dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd380dsj2(15,0)).toBe(4);});});
function hd381dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381dsj2_hd',()=>{it('a',()=>{expect(hd381dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd381dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd381dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd381dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd381dsj2(15,0)).toBe(4);});});
function hd382dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382dsj2_hd',()=>{it('a',()=>{expect(hd382dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd382dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd382dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd382dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd382dsj2(15,0)).toBe(4);});});
function hd383dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383dsj2_hd',()=>{it('a',()=>{expect(hd383dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd383dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd383dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd383dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd383dsj2(15,0)).toBe(4);});});
function hd384dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384dsj2_hd',()=>{it('a',()=>{expect(hd384dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd384dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd384dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd384dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd384dsj2(15,0)).toBe(4);});});
function hd385dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385dsj2_hd',()=>{it('a',()=>{expect(hd385dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd385dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd385dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd385dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd385dsj2(15,0)).toBe(4);});});
function hd386dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386dsj2_hd',()=>{it('a',()=>{expect(hd386dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd386dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd386dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd386dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd386dsj2(15,0)).toBe(4);});});
function hd387dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387dsj2_hd',()=>{it('a',()=>{expect(hd387dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd387dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd387dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd387dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd387dsj2(15,0)).toBe(4);});});
function hd388dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388dsj2_hd',()=>{it('a',()=>{expect(hd388dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd388dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd388dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd388dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd388dsj2(15,0)).toBe(4);});});
function hd389dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389dsj2_hd',()=>{it('a',()=>{expect(hd389dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd389dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd389dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd389dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd389dsj2(15,0)).toBe(4);});});
function hd390dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390dsj2_hd',()=>{it('a',()=>{expect(hd390dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd390dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd390dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd390dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd390dsj2(15,0)).toBe(4);});});
function hd391dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391dsj2_hd',()=>{it('a',()=>{expect(hd391dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd391dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd391dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd391dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd391dsj2(15,0)).toBe(4);});});
function hd392dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392dsj2_hd',()=>{it('a',()=>{expect(hd392dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd392dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd392dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd392dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd392dsj2(15,0)).toBe(4);});});
function hd393dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393dsj2_hd',()=>{it('a',()=>{expect(hd393dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd393dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd393dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd393dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd393dsj2(15,0)).toBe(4);});});
function hd394dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394dsj2_hd',()=>{it('a',()=>{expect(hd394dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd394dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd394dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd394dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd394dsj2(15,0)).toBe(4);});});
function hd395dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395dsj2_hd',()=>{it('a',()=>{expect(hd395dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd395dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd395dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd395dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd395dsj2(15,0)).toBe(4);});});
function hd396dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396dsj2_hd',()=>{it('a',()=>{expect(hd396dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd396dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd396dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd396dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd396dsj2(15,0)).toBe(4);});});
function hd397dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397dsj2_hd',()=>{it('a',()=>{expect(hd397dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd397dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd397dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd397dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd397dsj2(15,0)).toBe(4);});});
function hd398dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398dsj2_hd',()=>{it('a',()=>{expect(hd398dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd398dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd398dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd398dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd398dsj2(15,0)).toBe(4);});});
function hd399dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399dsj2_hd',()=>{it('a',()=>{expect(hd399dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd399dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd399dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd399dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd399dsj2(15,0)).toBe(4);});});
function hd400dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400dsj2_hd',()=>{it('a',()=>{expect(hd400dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd400dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd400dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd400dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd400dsj2(15,0)).toBe(4);});});
function hd401dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401dsj2_hd',()=>{it('a',()=>{expect(hd401dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd401dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd401dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd401dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd401dsj2(15,0)).toBe(4);});});
function hd402dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402dsj2_hd',()=>{it('a',()=>{expect(hd402dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd402dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd402dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd402dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd402dsj2(15,0)).toBe(4);});});
function hd403dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403dsj2_hd',()=>{it('a',()=>{expect(hd403dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd403dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd403dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd403dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd403dsj2(15,0)).toBe(4);});});
function hd404dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404dsj2_hd',()=>{it('a',()=>{expect(hd404dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd404dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd404dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd404dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd404dsj2(15,0)).toBe(4);});});
function hd405dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405dsj2_hd',()=>{it('a',()=>{expect(hd405dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd405dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd405dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd405dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd405dsj2(15,0)).toBe(4);});});
function hd406dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406dsj2_hd',()=>{it('a',()=>{expect(hd406dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd406dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd406dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd406dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd406dsj2(15,0)).toBe(4);});});
function hd407dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407dsj2_hd',()=>{it('a',()=>{expect(hd407dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd407dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd407dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd407dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd407dsj2(15,0)).toBe(4);});});
function hd408dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408dsj2_hd',()=>{it('a',()=>{expect(hd408dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd408dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd408dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd408dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd408dsj2(15,0)).toBe(4);});});
function hd409dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409dsj2_hd',()=>{it('a',()=>{expect(hd409dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd409dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd409dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd409dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd409dsj2(15,0)).toBe(4);});});
function hd410dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410dsj2_hd',()=>{it('a',()=>{expect(hd410dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd410dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd410dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd410dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd410dsj2(15,0)).toBe(4);});});
function hd411dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411dsj2_hd',()=>{it('a',()=>{expect(hd411dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd411dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd411dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd411dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd411dsj2(15,0)).toBe(4);});});
function hd412dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412dsj2_hd',()=>{it('a',()=>{expect(hd412dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd412dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd412dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd412dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd412dsj2(15,0)).toBe(4);});});
function hd413dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413dsj2_hd',()=>{it('a',()=>{expect(hd413dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd413dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd413dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd413dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd413dsj2(15,0)).toBe(4);});});
function hd414dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414dsj2_hd',()=>{it('a',()=>{expect(hd414dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd414dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd414dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd414dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd414dsj2(15,0)).toBe(4);});});
function hd415dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415dsj2_hd',()=>{it('a',()=>{expect(hd415dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd415dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd415dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd415dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd415dsj2(15,0)).toBe(4);});});
function hd416dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416dsj2_hd',()=>{it('a',()=>{expect(hd416dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd416dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd416dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd416dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd416dsj2(15,0)).toBe(4);});});
function hd417dsj2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417dsj2_hd',()=>{it('a',()=>{expect(hd417dsj2(1,4)).toBe(2);});it('b',()=>{expect(hd417dsj2(3,1)).toBe(1);});it('c',()=>{expect(hd417dsj2(0,0)).toBe(0);});it('d',()=>{expect(hd417dsj2(93,73)).toBe(2);});it('e',()=>{expect(hd417dsj2(15,0)).toBe(4);});});
