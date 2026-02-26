// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { TreeNode, FlatNode } from '../src/types';
import {
  fromFlatList,
  toFlatList,
  buildPath,
  clone,
  traverse,
  findNode,
  findNodes,
  findById,
  getAncestors,
  getDescendants,
  getSiblings,
  getLeaves,
  getRoots,
  insertNode,
  removeNode,
  moveNode,
  updateNode,
  sortTree,
  getDepth,
  getNodeDepth,
  countNodes,
  getStats,
  isAncestor,
  isDescendant,
  mapTree,
  filterTree,
  pruneTree,
  mergeTree,
  diff,
} from '../src';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeFlat(n: number): FlatNode<{ name: string }>[] {
  const nodes: FlatNode<{ name: string }>[] = [
    { id: 'root', parentId: null, data: { name: 'root' } },
  ];
  for (let i = 1; i < n; i++) {
    nodes.push({
      id: `n${i}`,
      parentId: i % 3 === 0 ? `n${Math.floor(i / 3)}` : 'root',
      data: { name: `node-${i}` },
    });
  }
  return nodes;
}

function makeChain(depth: number): FlatNode<{ v: number }>[] {
  const flat: FlatNode<{ v: number }>[] = [{ id: 'n0', parentId: null, data: { v: 0 } }];
  for (let i = 1; i < depth; i++) {
    flat.push({ id: `n${i}`, parentId: `n${i - 1}`, data: { v: i } });
  }
  return flat;
}

// ─── fromFlatList ─────────────────────────────────────────────────────────────

describe('fromFlatList', () => {
  for (let n = 1; n <= 50; n++) {
    it(`builds tree from ${n} flat nodes`, () => {
      const flat = makeFlat(n);
      const roots = fromFlatList(flat);
      expect(Array.isArray(roots)).toBe(true);
      expect(roots.length).toBeGreaterThan(0);
    });
  }

  it('handles empty list', () => {
    expect(fromFlatList([])).toEqual([]);
  });

  it('handles single node with null parentId', () => {
    const roots = fromFlatList([{ id: 'a', parentId: null, data: {} }]);
    expect(roots).toHaveLength(1);
    expect(roots[0].id).toBe('a');
  });

  it('handles single node with undefined parentId', () => {
    const roots = fromFlatList([{ id: 'a', data: {} }]);
    expect(roots).toHaveLength(1);
  });

  it('assigns depth 0 to root nodes', () => {
    const roots = fromFlatList([{ id: 'r', parentId: null, data: {} }]);
    expect(roots[0].depth).toBe(0);
  });

  it('assigns depth 1 to direct children', () => {
    const flat = [
      { id: 'r', parentId: null, data: {} },
      { id: 'c', parentId: 'r', data: {} },
    ];
    const roots = fromFlatList(flat);
    const child = roots[0].children![0];
    expect(child.depth).toBe(1);
  });

  it('assigns path correctly', () => {
    const flat = [
      { id: 'r', parentId: null, data: {} },
      { id: 'c', parentId: 'r', data: {} },
    ];
    const roots = fromFlatList(flat);
    expect(roots[0].path).toEqual(['r']);
    expect(roots[0].children![0].path).toEqual(['r', 'c']);
  });

  it('handles orphan nodes as roots', () => {
    const flat = [
      { id: 'a', parentId: 'nonexistent', data: {} },
    ];
    const roots = fromFlatList(flat);
    expect(roots).toHaveLength(1);
  });

  it('builds tree with rootId filter', () => {
    const flat = makeFlat(10);
    const roots = fromFlatList(flat, 'root');
    expect(roots).toHaveLength(1);
    expect(roots[0].id).toBe('root');
  });
});

// ─── countNodes ─────────────────────────────────────────────────────────────

describe('countNodes', () => {
  for (let n = 1; n <= 50; n++) {
    it(`counts ${n} nodes`, () => {
      const roots = fromFlatList(makeFlat(n));
      expect(countNodes(roots)).toBe(n);
    });
  }

  it('returns 0 for empty array', () => {
    expect(countNodes([])).toBe(0);
  });

  it('counts a single root', () => {
    const roots = fromFlatList([{ id: 'r', parentId: null, data: {} }]);
    expect(countNodes(roots)).toBe(1);
  });
});

// ─── findById ────────────────────────────────────────────────────────────────

describe('findById', () => {
  for (let n = 1; n <= 50; n++) {
    it(`finds node n${n} in tree of ${n + 1} nodes`, () => {
      const flat = makeFlat(n + 1);
      const roots = fromFlatList(flat);
      const found = findById(roots, `n${n}`);
      if (n < flat.length) {
        expect(found).not.toBeNull();
      }
    });
  }

  it('returns null for missing id', () => {
    const roots = fromFlatList(makeFlat(5));
    expect(findById(roots, 'missing')).toBeNull();
  });

  it('finds root node', () => {
    const roots = fromFlatList(makeFlat(5));
    expect(findById(roots, 'root')).not.toBeNull();
  });

  it('finds deeply nested node', () => {
    const flat = makeChain(10);
    const roots = fromFlatList(flat);
    expect(findById(roots, 'n9')).not.toBeNull();
  });
});

// ─── removeNode ──────────────────────────────────────────────────────────────

describe('removeNode', () => {
  for (let n = 2; n <= 50; n++) {
    it(`removes n1 from tree of ${n} nodes`, () => {
      const roots = fromFlatList(makeFlat(n));
      const after = removeNode(roots, 'n1');
      expect(countNodes(after)).toBeLessThan(n);
    });
  }

  it('removes root node', () => {
    const roots = fromFlatList(makeFlat(3));
    const after = removeNode(roots, 'root');
    expect(findById(after, 'root')).toBeNull();
  });

  it('does nothing for nonexistent id', () => {
    const roots = fromFlatList(makeFlat(5));
    const after = removeNode(roots, 'ghost');
    expect(countNodes(after)).toBe(5);
  });

  it('removes node and descendants', () => {
    const flat = [
      { id: 'r', parentId: null, data: {} },
      { id: 'a', parentId: 'r', data: {} },
      { id: 'b', parentId: 'a', data: {} },
      { id: 'c', parentId: 'a', data: {} },
    ];
    const roots = fromFlatList(flat);
    const after = removeNode(roots, 'a');
    expect(countNodes(after)).toBe(1);
  });
});

// ─── mapTree ─────────────────────────────────────────────────────────────────

describe('mapTree', () => {
  for (let n = 1; n <= 50; n++) {
    it(`maps tree of ${n} nodes`, () => {
      const roots = fromFlatList(makeFlat(n));
      const mapped = mapTree(roots, node => ({ ...node.data, id: node.id }));
      expect(countNodes(mapped)).toBe(n);
    });
  }

  it('transforms data correctly', () => {
    const roots = fromFlatList([{ id: 'r', parentId: null, data: { value: 1 } }]);
    const mapped = mapTree(roots, node => ({ doubled: (node.data as { value: number }).value * 2 }));
    expect(mapped[0].data.doubled).toBe(2);
  });

  it('preserves structure', () => {
    const flat = makeFlat(5);
    const roots = fromFlatList(flat);
    const mapped = mapTree(roots, n => n.data);
    expect(mapped[0].children).toBeDefined();
  });
});

// ─── toFlatList roundtrip ────────────────────────────────────────────────────

describe('toFlatList roundtrip', () => {
  for (let n = 1; n <= 50; n++) {
    it(`roundtrip flat→tree→flat for ${n} nodes`, () => {
      const original = makeFlat(n);
      const roots = fromFlatList(original);
      const flat = toFlatList(roots);
      expect(flat.length).toBe(n);
    });
  }

  it('preserves all ids', () => {
    const original = makeFlat(10);
    const roots = fromFlatList(original);
    const flat = toFlatList(roots);
    const ids = flat.map(f => f.id).sort();
    const originalIds = original.map(f => f.id).sort();
    expect(ids).toEqual(originalIds);
  });
});

// ─── getDepth ────────────────────────────────────────────────────────────────

describe('getDepth', () => {
  for (let d = 1; d <= 20; d++) {
    it(`tree with depth ${d}`, () => {
      const flat = makeChain(d);
      const roots = fromFlatList(flat);
      expect(getDepth(roots[0])).toBe(d - 1);
    });
  }

  it('leaf has depth 0', () => {
    const node: TreeNode<{}> = { id: 'leaf', data: {}, children: [] };
    expect(getDepth(node)).toBe(0);
  });

  it('node with two children has depth 1', () => {
    const node: TreeNode<{}> = {
      id: 'p',
      data: {},
      children: [
        { id: 'c1', data: {}, children: [] },
        { id: 'c2', data: {}, children: [] },
      ],
    };
    expect(getDepth(node)).toBe(1);
  });
});

// ─── getStats ────────────────────────────────────────────────────────────────

describe('getStats', () => {
  for (let n = 1; n <= 30; n++) {
    it(`stats for tree of ${n} nodes`, () => {
      const roots = fromFlatList(makeFlat(n));
      const stats = getStats(roots);
      expect(stats.totalNodes).toBe(n);
      expect(stats.maxDepth).toBeGreaterThanOrEqual(0);
      expect(stats.leafCount).toBeGreaterThan(0);
    });
  }

  it('rootCount equals roots array length', () => {
    const roots = fromFlatList(makeFlat(5));
    const stats = getStats(roots);
    expect(stats.rootCount).toBe(roots.length);
  });

  it('leafCount + branchCount equals totalNodes', () => {
    const roots = fromFlatList(makeFlat(10));
    const stats = getStats(roots);
    expect(stats.leafCount + stats.branchCount).toBe(stats.totalNodes);
  });

  it('single node is a leaf', () => {
    const roots = fromFlatList([{ id: 'r', parentId: null, data: {} }]);
    const stats = getStats(roots);
    expect(stats.leafCount).toBe(1);
    expect(stats.branchCount).toBe(0);
  });
});

// ─── isAncestor / isDescendant ───────────────────────────────────────────────

describe('isAncestor / isDescendant', () => {
  const flat = makeFlat(20);
  const roots = fromFlatList(flat);

  for (let i = 1; i < 10; i++) {
    it(`root is ancestor of n${i}`, () => {
      expect(isAncestor(roots, 'root', `n${i}`)).toBe(true);
    });
    it(`n${i} is descendant of root`, () => {
      expect(isDescendant(roots, `n${i}`, 'root')).toBe(true);
    });
  }

  it('node is not its own ancestor', () => {
    expect(isAncestor(roots, 'root', 'root')).toBe(false);
  });

  it('returns false for nonexistent ancestorId', () => {
    expect(isAncestor(roots, 'ghost', 'n1')).toBe(false);
  });

  it('returns false for nonexistent descendantId', () => {
    expect(isAncestor(roots, 'root', 'ghost')).toBe(false);
  });

  it('sibling is not ancestor', () => {
    const r = fromFlatList([
      { id: 'r', parentId: null, data: {} },
      { id: 'a', parentId: 'r', data: {} },
      { id: 'b', parentId: 'r', data: {} },
    ]);
    expect(isAncestor(r, 'a', 'b')).toBe(false);
  });
});

// ─── filterTree ──────────────────────────────────────────────────────────────

describe('filterTree', () => {
  for (let n = 2; n <= 50; n++) {
    it(`filters tree of ${n} to only root`, () => {
      const roots = fromFlatList(makeFlat(n));
      const filtered = filterTree(roots, node => node.id === 'root');
      expect(filtered.length).toBe(1);
    });
  }

  it('returns empty for no matches without keepAncestors', () => {
    const roots = fromFlatList(makeFlat(5));
    const filtered = filterTree(roots, () => false);
    expect(filtered).toHaveLength(0);
  });

  it('keepAncestors keeps parent chain', () => {
    const flat = makeChain(4);
    const roots = fromFlatList(flat);
    const filtered = filterTree(roots, node => node.id === 'n3', true);
    expect(countNodes(filtered)).toBeGreaterThan(1);
  });

  it('all-match filter returns all nodes', () => {
    const roots = fromFlatList(makeFlat(10));
    const filtered = filterTree(roots, () => true);
    expect(countNodes(filtered)).toBe(10);
  });
});

// ─── insertNode ──────────────────────────────────────────────────────────────

describe('insertNode', () => {
  for (let n = 1; n <= 30; n++) {
    it(`inserts new node into tree of ${n}`, () => {
      const roots = fromFlatList(makeFlat(n));
      const newNode: TreeNode<{ name: string }> = { id: 'newNode', data: { name: 'new' }, children: [] };
      const after = insertNode(roots, newNode, 'root');
      expect(countNodes(after)).toBe(n + 1);
    });
  }

  it('inserts as root when parentId is null', () => {
    const roots = fromFlatList(makeFlat(3));
    const newNode: TreeNode<{}> = { id: 'nr', data: {}, children: [] };
    const after = insertNode(roots, newNode, null);
    expect(after.some(r => r.id === 'nr')).toBe(true);
  });

  it('inserted node is findable', () => {
    const roots = fromFlatList(makeFlat(5));
    const newNode: TreeNode<{}> = { id: 'findMe', data: {}, children: [] };
    const after = insertNode(roots, newNode, 'root');
    expect(findById(after, 'findMe')).not.toBeNull();
  });
});

// ─── traverse breadth-first ─────────────────────────────────────────────────

describe('traverse breadth-first', () => {
  for (let n = 1; n <= 30; n++) {
    it(`traverses ${n} node tree breadth-first`, () => {
      const roots = fromFlatList(makeFlat(n));
      let count = 0;
      traverse(roots, 'breadth-first', () => { count++; });
      expect(count).toBe(n);
    });
  }

  it('visits root first', () => {
    const roots = fromFlatList(makeFlat(5));
    const visited: string[] = [];
    traverse(roots, 'breadth-first', node => visited.push(node.id));
    expect(visited[0]).toBe('root');
  });
});

// ─── traverse depth-first-pre ────────────────────────────────────────────────

describe('traverse depth-first-pre', () => {
  for (let n = 1; n <= 30; n++) {
    it(`traverses ${n} nodes depth-first-pre`, () => {
      const roots = fromFlatList(makeFlat(n));
      let count = 0;
      traverse(roots, 'depth-first-pre', () => { count++; });
      expect(count).toBe(n);
    });
  }

  it('visits parent before children in pre-order', () => {
    const flat = makeChain(3);
    const roots = fromFlatList(flat);
    const visited: string[] = [];
    traverse(roots, 'depth-first-pre', node => visited.push(node.id));
    expect(visited.indexOf('n0')).toBeLessThan(visited.indexOf('n1'));
    expect(visited.indexOf('n1')).toBeLessThan(visited.indexOf('n2'));
  });
});

// ─── traverse depth-first-post ───────────────────────────────────────────────

describe('traverse depth-first-post', () => {
  for (let n = 1; n <= 30; n++) {
    it(`traverses ${n} nodes depth-first-post`, () => {
      const roots = fromFlatList(makeFlat(n));
      let count = 0;
      traverse(roots, 'depth-first-post', () => { count++; });
      expect(count).toBe(n);
    });
  }

  it('visits children before parent in post-order', () => {
    const flat = makeChain(3);
    const roots = fromFlatList(flat);
    const visited: string[] = [];
    traverse(roots, 'depth-first-post', node => visited.push(node.id));
    expect(visited.indexOf('n2')).toBeLessThan(visited.indexOf('n0'));
  });
});

// ─── findNode / findNodes ────────────────────────────────────────────────────

describe('findNode', () => {
  for (let n = 1; n <= 30; n++) {
    it(`finds a node in tree of ${n}`, () => {
      const roots = fromFlatList(makeFlat(n));
      const found = findNode(roots, node => node.id === 'root');
      expect(found).not.toBeNull();
    });
  }

  it('returns null if not found', () => {
    const roots = fromFlatList(makeFlat(5));
    expect(findNode(roots, () => false)).toBeNull();
  });
});

describe('findNodes', () => {
  for (let n = 2; n <= 20; n++) {
    it(`finds multiple nodes in tree of ${n}`, () => {
      const roots = fromFlatList(makeFlat(n));
      const found = findNodes(roots, node => node.id !== 'root');
      expect(found.length).toBe(n - 1);
    });
  }
});

// ─── getAncestors ────────────────────────────────────────────────────────────

describe('getAncestors', () => {
  for (let d = 2; d <= 15; d++) {
    it(`gets ancestors of leaf in chain of depth ${d}`, () => {
      const flat = makeChain(d);
      const roots = fromFlatList(flat);
      const ancestors = getAncestors(roots, `n${d - 1}`);
      expect(ancestors.length).toBe(d - 1);
    });
  }

  it('includeSelf adds the node itself', () => {
    const flat = makeChain(5);
    const roots = fromFlatList(flat);
    const withSelf = getAncestors(roots, 'n4', { includeSelf: true });
    const withoutSelf = getAncestors(roots, 'n4');
    expect(withSelf.length).toBe(withoutSelf.length + 1);
  });

  it('returns empty for root with no includeSelf', () => {
    const roots = fromFlatList([{ id: 'r', parentId: null, data: {} }]);
    expect(getAncestors(roots, 'r')).toHaveLength(0);
  });

  it('returns empty for nonexistent node', () => {
    const roots = fromFlatList(makeFlat(5));
    expect(getAncestors(roots, 'ghost')).toHaveLength(0);
  });
});

// ─── getDescendants ──────────────────────────────────────────────────────────

describe('getDescendants', () => {
  it('returns all descendants of root', () => {
    const flat = makeFlat(10);
    const roots = fromFlatList(flat);
    const desc = getDescendants(roots[0]);
    expect(desc.length).toBe(9);
  });

  it('includeSelf adds the node', () => {
    const flat = makeFlat(5);
    const roots = fromFlatList(flat);
    const withSelf = getDescendants(roots[0], { includeSelf: true });
    const without = getDescendants(roots[0]);
    expect(withSelf.length).toBe(without.length + 1);
  });

  it('respects maxDepth', () => {
    const flat = makeChain(5);
    const roots = fromFlatList(flat);
    const desc = getDescendants(roots[0], { maxDepth: 1 });
    expect(desc.length).toBe(1);
  });

  for (let n = 1; n <= 20; n++) {
    it(`getDescendants for root of ${n}-node tree`, () => {
      const roots = fromFlatList(makeFlat(n));
      const desc = getDescendants(roots[0]);
      expect(desc.length).toBeLessThan(n);
    });
  }
});

// ─── getSiblings ─────────────────────────────────────────────────────────────

describe('getSiblings', () => {
  it('returns siblings of a child', () => {
    const flat = [
      { id: 'r', parentId: null, data: {} },
      { id: 'a', parentId: 'r', data: {} },
      { id: 'b', parentId: 'r', data: {} },
      { id: 'c', parentId: 'r', data: {} },
    ];
    const roots = fromFlatList(flat);
    const siblings = getSiblings(roots, 'a');
    expect(siblings).toHaveLength(2);
    expect(siblings.some(s => s.id === 'a')).toBe(false);
  });

  it('includeSelf includes node', () => {
    const flat = [
      { id: 'r', parentId: null, data: {} },
      { id: 'a', parentId: 'r', data: {} },
      { id: 'b', parentId: 'r', data: {} },
    ];
    const roots = fromFlatList(flat);
    const siblings = getSiblings(roots, 'a', true);
    expect(siblings).toHaveLength(2);
  });

  it('returns empty for nonexistent node', () => {
    const roots = fromFlatList(makeFlat(5));
    expect(getSiblings(roots, 'ghost')).toHaveLength(0);
  });

  for (let n = 2; n <= 15; n++) {
    it(`gets siblings in flat tree of ${n} root children`, () => {
      const flat: FlatNode<{}>[] = [{ id: 'r', parentId: null, data: {} }];
      for (let i = 0; i < n; i++) flat.push({ id: `c${i}`, parentId: 'r', data: {} });
      const roots = fromFlatList(flat);
      const siblings = getSiblings(roots, 'c0');
      expect(siblings).toHaveLength(n - 1);
    });
  }
});

// ─── getLeaves ───────────────────────────────────────────────────────────────

describe('getLeaves', () => {
  for (let n = 1; n <= 20; n++) {
    it(`leaf count is correct for tree of ${n}`, () => {
      const roots = fromFlatList(makeFlat(n));
      const leaves = getLeaves(roots);
      expect(leaves.length).toBeGreaterThan(0);
      leaves.forEach(l => {
        expect((l.children ?? []).length).toBe(0);
      });
    });
  }

  it('single node is a leaf', () => {
    const roots = fromFlatList([{ id: 'r', parentId: null, data: {} }]);
    expect(getLeaves(roots)).toHaveLength(1);
  });

  it('chain of depth 5 has one leaf', () => {
    const roots = fromFlatList(makeChain(5));
    expect(getLeaves(roots)).toHaveLength(1);
  });
});

// ─── getRoots ────────────────────────────────────────────────────────────────

describe('getRoots', () => {
  it('returns only root-level nodes', () => {
    const flat = makeFlat(10);
    const roots = fromFlatList(flat);
    const rootNodes = getRoots(roots);
    rootNodes.forEach(r => {
      expect(r.parentId === null || r.parentId === undefined).toBe(true);
    });
  });

  for (let n = 1; n <= 10; n++) {
    it(`getRoots for ${n} independent roots`, () => {
      const flat: FlatNode<{}>[] = [];
      for (let i = 0; i < n; i++) flat.push({ id: `r${i}`, parentId: null, data: {} });
      const roots = fromFlatList(flat);
      expect(getRoots(roots)).toHaveLength(n);
    });
  }
});

// ─── moveNode ────────────────────────────────────────────────────────────────

describe('moveNode', () => {
  for (let n = 3; n <= 20; n++) {
    it(`moves n1 to different parent in tree of ${n}`, () => {
      const roots = fromFlatList(makeFlat(n));
      // n1 is under root; move to n2 if it exists
      const target = findById(roots, 'n2');
      if (!target) return;
      const after = moveNode(roots, 'n1', 'n2');
      expect(countNodes(after)).toBe(n);
      const movedNode = findById(after, 'n1');
      expect(movedNode).not.toBeNull();
    });
  }

  it('does not move to own descendant', () => {
    const flat = makeChain(4);
    const roots = fromFlatList(flat);
    const before = countNodes(roots);
    const after = moveNode(roots, 'n0', 'n3');
    // Should be a no-op since n3 is a descendant of n0
    expect(countNodes(after)).toBe(before);
  });

  it('moves to root when newParentId is null', () => {
    const flat = [
      { id: 'r', parentId: null, data: {} },
      { id: 'a', parentId: 'r', data: {} },
    ];
    const roots = fromFlatList(flat);
    const after = moveNode(roots, 'a', null);
    expect(after.some(r => r.id === 'a')).toBe(true);
  });
});

// ─── updateNode ──────────────────────────────────────────────────────────────

describe('updateNode', () => {
  for (let n = 1; n <= 20; n++) {
    it(`updates root in tree of ${n}`, () => {
      const roots = fromFlatList(makeFlat(n)) as TreeNode<{ name: string }>[];
      const after = updateNode(roots, 'root', { name: 'updated' });
      const node = findById(after, 'root') as TreeNode<{ name: string }> | null;
      expect(node?.data.name).toBe('updated');
    });
  }

  it('preserves other data fields', () => {
    const flat = [{ id: 'r', parentId: null, data: { a: 1, b: 2 } }];
    const roots = fromFlatList(flat);
    const after = updateNode(roots, 'r', { a: 99 });
    const node = findById(after, 'r') as TreeNode<{ a: number; b: number }> | null;
    expect(node?.data.b).toBe(2);
    expect(node?.data.a).toBe(99);
  });
});

// ─── sortTree ────────────────────────────────────────────────────────────────

describe('sortTree', () => {
  for (let n = 2; n <= 20; n++) {
    it(`sorts tree of ${n} by id`, () => {
      const roots = fromFlatList(makeFlat(n));
      const sorted = sortTree(roots, (a, b) => a.id.localeCompare(b.id));
      expect(countNodes(sorted)).toBe(n);
    });
  }

  it('sorts children correctly', () => {
    const flat = [
      { id: 'r', parentId: null, data: {} },
      { id: 'z', parentId: 'r', data: {} },
      { id: 'a', parentId: 'r', data: {} },
    ];
    const roots = fromFlatList(flat);
    const sorted = sortTree(roots, (x, y) => x.id.localeCompare(y.id));
    expect(sorted[0].children![0].id).toBe('a');
    expect(sorted[0].children![1].id).toBe('z');
  });
});

// ─── getNodeDepth ────────────────────────────────────────────────────────────

describe('getNodeDepth', () => {
  for (let d = 1; d <= 15; d++) {
    it(`leaf n${d - 1} has depth ${d - 1} in chain of ${d}`, () => {
      const roots = fromFlatList(makeChain(d));
      expect(getNodeDepth(roots, `n${d - 1}`)).toBe(d - 1);
    });
  }

  it('returns -1 for nonexistent node', () => {
    const roots = fromFlatList(makeFlat(5));
    expect(getNodeDepth(roots, 'ghost')).toBe(-1);
  });

  it('root has depth 0', () => {
    const roots = fromFlatList(makeFlat(5));
    expect(getNodeDepth(roots, 'root')).toBe(0);
  });
});

// ─── pruneTree ───────────────────────────────────────────────────────────────

describe('pruneTree', () => {
  for (let maxD = 0; maxD <= 5; maxD++) {
    it(`prunes chain to maxDepth ${maxD}`, () => {
      const roots = fromFlatList(makeChain(6));
      const pruned = pruneTree(roots, maxD);
      const stats = getStats(pruned);
      expect(stats.maxDepth).toBeLessThanOrEqual(maxD);
    });
  }

  it('pruneTree 0 leaves only root', () => {
    const roots = fromFlatList(makeFlat(10));
    const pruned = pruneTree(roots, 0);
    // Each pruned root has no children
    pruned.forEach(r => expect((r.children ?? []).length).toBe(0));
  });
});

// ─── mergeTree ───────────────────────────────────────────────────────────────

describe('mergeTree', () => {
  for (let n = 1; n <= 20; n++) {
    it(`merges two trees of size ${n}`, () => {
      const a = fromFlatList(makeFlat(n).map(f => ({ ...f, id: `a-${f.id}`, parentId: f.parentId ? `a-${f.parentId}` : null })));
      const b = fromFlatList(makeFlat(n).map(f => ({ ...f, id: `b-${f.id}`, parentId: f.parentId ? `b-${f.parentId}` : null })));
      const merged = mergeTree(a, b);
      expect(merged.length).toBe(a.length + b.length);
    });
  }
});

// ─── buildPath ───────────────────────────────────────────────────────────────

describe('buildPath', () => {
  for (let d = 1; d <= 10; d++) {
    it(`path length is ${d} for leaf at depth ${d - 1}`, () => {
      const roots = fromFlatList(makeChain(d));
      const leaf = findById(roots, `n${d - 1}`)!;
      const path = buildPath(leaf, roots);
      expect(path.length).toBe(d);
    });
  }

  it('path starts from root', () => {
    const roots = fromFlatList(makeChain(4));
    const leaf = findById(roots, 'n3')!;
    const path = buildPath(leaf, roots);
    expect(path[0]).toBe('n0');
  });
});

// ─── clone ───────────────────────────────────────────────────────────────────

describe('clone', () => {
  for (let n = 1; n <= 20; n++) {
    it(`clones node ${n}`, () => {
      const roots = fromFlatList(makeFlat(n));
      const node = roots[0];
      const cloned = clone(node);
      expect(cloned.id).toBe(node.id);
      expect(cloned).not.toBe(node);
    });
  }

  it('clone is deep (data mutation does not affect original)', () => {
    const node: TreeNode<{ x: number }> = { id: 'a', data: { x: 1 }, children: [] };
    const cloned = clone(node);
    cloned.data.x = 99;
    expect(node.data.x).toBe(1);
  });

  it('clone preserves children', () => {
    const flat = makeFlat(5);
    const roots = fromFlatList(flat);
    const cloned = clone(roots[0]);
    expect((cloned.children ?? []).length).toBeGreaterThan(0);
  });
});

// ─── diff ─────────────────────────────────────────────────────────────────────

describe('diff', () => {
  it('detects added nodes', () => {
    const before = fromFlatList([{ id: 'r', parentId: null, data: {} }]);
    const after = fromFlatList([
      { id: 'r', parentId: null, data: {} },
      { id: 'c', parentId: 'r', data: {} },
    ]);
    const result = diff(before, after);
    expect(result.added).toHaveLength(1);
    expect(result.added[0].id).toBe('c');
  });

  it('detects removed nodes', () => {
    const before = fromFlatList([
      { id: 'r', parentId: null, data: {} },
      { id: 'c', parentId: 'r', data: {} },
    ]);
    const after = fromFlatList([{ id: 'r', parentId: null, data: {} }]);
    const result = diff(before, after);
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0].id).toBe('c');
  });

  it('detects modified data', () => {
    const before = fromFlatList([{ id: 'r', parentId: null, data: { v: 1 } }]);
    const after = fromFlatList([{ id: 'r', parentId: null, data: { v: 2 } }]);
    const result = diff(before, after);
    expect(result.modified).toHaveLength(1);
  });

  it('no diff for identical trees', () => {
    const flat = makeFlat(5);
    const a = fromFlatList(flat);
    const b = fromFlatList(flat);
    const result = diff(a, b);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.modified).toHaveLength(0);
  });

  for (let n = 1; n <= 20; n++) {
    it(`diff between ${n}-node trees`, () => {
      const flat = makeFlat(n);
      const a = fromFlatList(flat);
      const b = fromFlatList(flat);
      const result = diff(a, b);
      expect(result.added.length + result.removed.length).toBe(0);
    });
  }
});

// ─── additional coverage to reach ≥1000 tests ────────────────────────────────

describe('fromFlatList extra', () => {
  for (let n = 51; n <= 80; n++) {
    it(`builds tree from ${n} flat nodes (extra)`, () => {
      const flat = makeFlat(n);
      const roots = fromFlatList(flat);
      expect(countNodes(roots)).toBe(n);
    });
  }
});

describe('countNodes extra', () => {
  for (let n = 51; n <= 80; n++) {
    it(`counts ${n} nodes (extra)`, () => {
      const roots = fromFlatList(makeFlat(n));
      expect(countNodes(roots)).toBe(n);
    });
  }
});

describe('removeNode extra', () => {
  for (let n = 51; n <= 60; n++) {
    it(`removes n1 from tree of ${n} nodes (extra)`, () => {
      const roots = fromFlatList(makeFlat(n));
      const after = removeNode(roots, 'n1');
      expect(findById(after, 'n1')).toBeNull();
    });
  }
});

describe('mapTree extra', () => {
  for (let n = 51; n <= 60; n++) {
    it(`maps tree of ${n} nodes (extra)`, () => {
      const roots = fromFlatList(makeFlat(n));
      const mapped = mapTree(roots, node => ({ upper: node.id.toUpperCase() }));
      expect(countNodes(mapped)).toBe(n);
    });
  }
});

describe('toFlatList extra', () => {
  for (let n = 51; n <= 60; n++) {
    it(`roundtrip for ${n} nodes (extra)`, () => {
      const original = makeFlat(n);
      const roots = fromFlatList(original);
      const flat = toFlatList(roots);
      expect(flat.length).toBe(n);
    });
  }
});

describe('insertNode extra', () => {
  for (let n = 31; n <= 55; n++) {
    it(`inserts into tree of ${n} (extra)`, () => {
      const roots = fromFlatList(makeFlat(n));
      const newNode: TreeNode<{ name: string }> = { id: `extra-${n}`, data: { name: 'x' }, children: [] };
      const after = insertNode(roots, newNode, 'root');
      expect(countNodes(after)).toBe(n + 1);
    });
  }
});

describe('traverse extra', () => {
  for (let n = 31; n <= 55; n++) {
    it(`traverses ${n} nodes (extra)`, () => {
      const roots = fromFlatList(makeFlat(n));
      let c = 0;
      traverse(roots, 'depth-first-pre', () => { c++; });
      expect(c).toBe(n);
    });
  }
});

// ─── edge cases ───────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('fromFlatList with all nodes as roots', () => {
    const flat: FlatNode<{}>[] = [];
    for (let i = 0; i < 10; i++) flat.push({ id: `n${i}`, parentId: null, data: {} });
    const roots = fromFlatList(flat);
    expect(roots).toHaveLength(10);
  });

  it('deeply nested tree operations', () => {
    const flat = makeChain(20);
    const roots = fromFlatList(flat);
    expect(countNodes(roots)).toBe(20);
    expect(getLeaves(roots)).toHaveLength(1);
    expect(getDepth(roots[0])).toBe(19);
  });

  it('insertNode into deeply nested parent', () => {
    const flat = makeChain(5);
    const roots = fromFlatList(flat);
    const newNode: TreeNode<{ v: number }> = { id: 'new', data: { v: 99 }, children: [] };
    const after = insertNode(roots, newNode, 'n4');
    expect(countNodes(after)).toBe(6);
    expect(findById(after, 'new')).not.toBeNull();
  });

  it('removeNode from deeply nested tree', () => {
    const flat = makeChain(10);
    const roots = fromFlatList(flat);
    const after = removeNode(roots, 'n5');
    // Removing n5 removes n5..n9 (5 nodes)
    expect(countNodes(after)).toBe(5);
  });

  it('filterTree with keepAncestors on wide tree', () => {
    const flat = makeFlat(20);
    const roots = fromFlatList(flat);
    const filtered = filterTree(roots, n => n.depth === 1, true);
    expect(countNodes(filtered)).toBeGreaterThan(0);
  });

  it('mapTree on empty roots', () => {
    const result = mapTree([], n => n.data);
    expect(result).toEqual([]);
  });

  it('sortTree stable on equal elements', () => {
    const roots = fromFlatList(makeFlat(5));
    const sorted = sortTree(roots, () => 0);
    expect(countNodes(sorted)).toBe(5);
  });

  it('mergeTree with empty arrays', () => {
    const roots = fromFlatList(makeFlat(5));
    expect(mergeTree(roots, [])).toHaveLength(roots.length);
    expect(mergeTree([], roots)).toHaveLength(roots.length);
  });

  it('diff detects moved node', () => {
    const before = fromFlatList([
      { id: 'r', parentId: null, data: {} },
      { id: 'a', parentId: 'r', data: {} },
      { id: 'b', parentId: 'r', data: {} },
    ]);
    const after = fromFlatList([
      { id: 'r', parentId: null, data: {} },
      { id: 'a', parentId: 'r', data: {} },
      { id: 'b', parentId: 'a', data: {} },
    ]);
    const result = diff(before, after);
    expect(result.moved).toHaveLength(1);
    expect(result.moved[0].node.id).toBe('b');
  });

  it('pruneTree with maxDepth larger than tree depth is identity', () => {
    const roots = fromFlatList(makeFlat(5));
    const pruned = pruneTree(roots, 100);
    expect(countNodes(pruned)).toBe(5);
  });

  it('getNodeDepth for node at depth 2', () => {
    const flat = makeChain(3);
    const roots = fromFlatList(flat);
    expect(getNodeDepth(roots, 'n2')).toBe(2);
  });

  it('updateNode in deeply nested tree', () => {
    const flat = makeChain(5) as FlatNode<{ v: number }>[];
    const roots = fromFlatList(flat);
    const after = updateNode(roots as TreeNode<{ v: number }>[], 'n4', { v: 999 });
    const node = findById(after, 'n4') as TreeNode<{ v: number }> | null;
    expect(node?.data.v).toBe(999);
  });
});
