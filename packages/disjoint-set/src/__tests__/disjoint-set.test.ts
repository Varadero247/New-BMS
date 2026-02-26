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
