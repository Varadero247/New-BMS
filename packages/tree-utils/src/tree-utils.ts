// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type {
  TreeNode,
  FlatNode,
  TraverseOrder,
  TreeStats,
  TreeDiff,
  AncestorOptions,
  DescendantOptions,
} from './types';

// ─── Construction ───────────────────────────────────────────────────────────

/**
 * Build a tree structure from a flat list of nodes with parentId references.
 * If rootId is provided, only the subtree rooted at that id is returned.
 */
export function fromFlatList<T>(
  nodes: FlatNode<T>[],
  rootId?: string | null,
): TreeNode<T>[] {
  const map = new Map<string, TreeNode<T>>();

  // First pass: create TreeNode wrappers
  for (const n of nodes) {
    map.set(n.id, { id: n.id, parentId: n.parentId ?? null, data: n.data, children: [] });
  }

  const roots: TreeNode<T>[] = [];

  // Second pass: wire up children
  for (const n of nodes) {
    const node = map.get(n.id)!;
    const pid = n.parentId ?? null;

    if (pid === null || pid === undefined) {
      if (rootId === undefined || rootId === null || n.id === rootId) {
        roots.push(node);
      }
    } else {
      const parent = map.get(pid);
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push(node);
      } else {
        // orphan — treat as root
        if (rootId === undefined || rootId === null) {
          roots.push(node);
        }
      }
    }
  }

  // Assign depth and path
  function assignMeta(node: TreeNode<T>, depth: number, path: string[]): void {
    node.depth = depth;
    node.path = [...path, node.id];
    for (const child of node.children ?? []) {
      assignMeta(child, depth + 1, node.path);
    }
  }
  for (const root of roots) {
    assignMeta(root, 0, []);
  }

  return roots;
}

/**
 * Flatten a tree back to a list with parentId references.
 */
export function toFlatList<T>(roots: TreeNode<T>[]): FlatNode<T>[] {
  const result: FlatNode<T>[] = [];

  function walk(node: TreeNode<T>): void {
    result.push({ id: node.id, parentId: node.parentId ?? null, data: node.data });
    for (const child of node.children ?? []) {
      walk(child);
    }
  }

  for (const root of roots) {
    walk(root);
  }

  return result;
}

/**
 * Build the id path from the root down to the given node.
 */
export function buildPath<T>(node: TreeNode<T>, tree: TreeNode<T>[]): string[] {
  if (node.path && node.path.length > 0) {
    return node.path;
  }
  // Fallback: traverse to find the node and record path
  const pathFound: string[] = [];

  function search(current: TreeNode<T>, acc: string[]): boolean {
    const next = [...acc, current.id];
    if (current.id === node.id) {
      pathFound.push(...next);
      return true;
    }
    for (const child of current.children ?? []) {
      if (search(child, next)) return true;
    }
    return false;
  }

  for (const root of tree) {
    if (search(root, [])) break;
  }

  return pathFound;
}

/**
 * Deep clone a tree node (including all descendants).
 */
export function clone<T>(node: TreeNode<T>): TreeNode<T> {
  return {
    id: node.id,
    parentId: node.parentId,
    data: JSON.parse(JSON.stringify(node.data)) as T,
    depth: node.depth,
    path: node.path ? [...node.path] : undefined,
    children: (node.children ?? []).map(clone),
  };
}

// ─── Traversal ──────────────────────────────────────────────────────────────

/**
 * Traverse a tree in the specified order, calling visitor for each node.
 */
export function traverse<T>(
  roots: TreeNode<T>[],
  order: TraverseOrder,
  visitor: (node: TreeNode<T>, depth: number) => void,
): void {
  if (order === 'breadth-first') {
    const queue: Array<{ node: TreeNode<T>; depth: number }> = roots.map(r => ({ node: r, depth: r.depth ?? 0 }));
    while (queue.length > 0) {
      const item = queue.shift()!;
      visitor(item.node, item.depth);
      for (const child of item.node.children ?? []) {
        queue.push({ node: child, depth: item.depth + 1 });
      }
    }
  } else if (order === 'depth-first-pre') {
    function dfsPreOrder(node: TreeNode<T>, depth: number): void {
      visitor(node, depth);
      for (const child of node.children ?? []) {
        dfsPreOrder(child, depth + 1);
      }
    }
    for (const root of roots) {
      dfsPreOrder(root, root.depth ?? 0);
    }
  } else {
    // depth-first-post
    function dfsPostOrder(node: TreeNode<T>, depth: number): void {
      for (const child of node.children ?? []) {
        dfsPostOrder(child, depth + 1);
      }
      visitor(node, depth);
    }
    for (const root of roots) {
      dfsPostOrder(root, root.depth ?? 0);
    }
  }
}

/**
 * Find the first node matching the predicate (depth-first).
 */
export function findNode<T>(
  roots: TreeNode<T>[],
  predicate: (node: TreeNode<T>) => boolean,
): TreeNode<T> | null {
  for (const root of roots) {
    const stack: TreeNode<T>[] = [root];
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (predicate(node)) return node;
      const children = node.children ?? [];
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i]);
      }
    }
  }
  return null;
}

/**
 * Find all nodes matching the predicate.
 */
export function findNodes<T>(
  roots: TreeNode<T>[],
  predicate: (node: TreeNode<T>) => boolean,
): TreeNode<T>[] {
  const results: TreeNode<T>[] = [];
  traverse(roots, 'depth-first-pre', node => {
    if (predicate(node)) results.push(node);
  });
  return results;
}

/**
 * Find a node by its id.
 */
export function findById<T>(roots: TreeNode<T>[], id: string): TreeNode<T> | null {
  return findNode(roots, node => node.id === id);
}

/**
 * Get all ancestors of the node with the given id.
 * Returns nodes from root down to (and optionally including) the target node.
 */
export function getAncestors<T>(
  roots: TreeNode<T>[],
  id: string,
  opts?: AncestorOptions,
): TreeNode<T>[] {
  const includeSelf = opts?.includeSelf ?? false;
  const ancestors: TreeNode<T>[] = [];

  function search(node: TreeNode<T>, path: TreeNode<T>[]): boolean {
    if (node.id === id) {
      ancestors.push(...path);
      if (includeSelf) ancestors.push(node);
      return true;
    }
    for (const child of node.children ?? []) {
      if (search(child, [...path, node])) return true;
    }
    return false;
  }

  for (const root of roots) {
    if (search(root, [])) break;
  }

  return ancestors;
}

/**
 * Get all descendants of a node.
 */
export function getDescendants<T>(
  node: TreeNode<T>,
  opts?: DescendantOptions,
): TreeNode<T>[] {
  const maxDepth = opts?.maxDepth ?? Infinity;
  const includeSelf = opts?.includeSelf ?? false;
  const results: TreeNode<T>[] = [];

  if (includeSelf) results.push(node);

  function walk(current: TreeNode<T>, depth: number): void {
    for (const child of current.children ?? []) {
      results.push(child);
      if (depth < maxDepth) {
        walk(child, depth + 1);
      }
    }
  }

  walk(node, 1);
  return results;
}

/**
 * Get siblings of the node with the given id.
 */
export function getSiblings<T>(
  roots: TreeNode<T>[],
  id: string,
  includeSelf = false,
): TreeNode<T>[] {
  // Find the parent and return its children (minus self if !includeSelf)
  const target = findById(roots, id);
  if (!target) return [];

  const pid = target.parentId ?? null;
  let siblings: TreeNode<T>[];

  if (pid === null) {
    // root-level sibling
    siblings = roots;
  } else {
    const parent = findById(roots, pid);
    siblings = parent?.children ?? [];
  }

  return includeSelf ? siblings : siblings.filter(s => s.id !== id);
}

/**
 * Get all leaf nodes (nodes with no children).
 */
export function getLeaves<T>(roots: TreeNode<T>[]): TreeNode<T>[] {
  return findNodes(roots, node => (node.children ?? []).length === 0);
}

/**
 * Get all root nodes from an array (already roots by definition).
 */
export function getRoots<T>(nodes: TreeNode<T>[]): TreeNode<T>[] {
  return nodes.filter(n => n.parentId === null || n.parentId === undefined);
}

// ─── Mutation ───────────────────────────────────────────────────────────────

/**
 * Return new roots with node inserted under parentId (or as root if parentId is null).
 */
export function insertNode<T>(
  roots: TreeNode<T>[],
  node: TreeNode<T>,
  parentId: string | null,
): TreeNode<T>[] {
  const newNode: TreeNode<T> = { ...clone(node), parentId };

  if (parentId === null) {
    return [...roots, newNode];
  }

  function insert(current: TreeNode<T>): TreeNode<T> {
    if (current.id === parentId) {
      return {
        ...current,
        children: [...(current.children ?? []), newNode],
      };
    }
    return {
      ...current,
      children: (current.children ?? []).map(insert),
    };
  }

  return roots.map(insert);
}

/**
 * Remove a node and all its descendants by id.
 */
export function removeNode<T>(roots: TreeNode<T>[], id: string): TreeNode<T>[] {
  function remove(nodes: TreeNode<T>[]): TreeNode<T>[] {
    return nodes
      .filter(n => n.id !== id)
      .map(n => ({ ...n, children: remove(n.children ?? []) }));
  }
  return remove(roots);
}

/**
 * Move a node to a new parent (or to root if newParentId is null).
 */
export function moveNode<T>(
  roots: TreeNode<T>[],
  id: string,
  newParentId: string | null,
): TreeNode<T>[] {
  const target = findById(roots, id);
  if (!target) return roots;

  // Cannot move a node into its own descendant
  const descendants = getDescendants(target);
  if (descendants.some(d => d.id === newParentId)) return roots;

  // Remove from current location
  const withoutNode = removeNode(roots, id);

  // Re-insert at new location
  const movedNode: TreeNode<T> = { ...clone(target), parentId: newParentId };
  return insertNode(withoutNode, movedNode, newParentId);
}

/**
 * Update the data of the node with the given id.
 */
export function updateNode<T>(
  roots: TreeNode<T>[],
  id: string,
  data: Partial<T>,
): TreeNode<T>[] {
  function update(node: TreeNode<T>): TreeNode<T> {
    if (node.id === id) {
      return { ...node, data: { ...node.data, ...data } };
    }
    return { ...node, children: (node.children ?? []).map(update) };
  }
  return roots.map(update);
}

/**
 * Recursively sort tree nodes using a comparator.
 */
export function sortTree<T>(
  roots: TreeNode<T>[],
  compareFn: (a: TreeNode<T>, b: TreeNode<T>) => number,
): TreeNode<T>[] {
  function sortNode(node: TreeNode<T>): TreeNode<T> {
    const sortedChildren = [...(node.children ?? [])].sort(compareFn).map(sortNode);
    return { ...node, children: sortedChildren };
  }
  return [...roots].sort(compareFn).map(sortNode);
}

// ─── Analysis ───────────────────────────────────────────────────────────────

/**
 * Get the maximum depth of a subtree (0 = leaf node).
 */
export function getDepth<T>(node: TreeNode<T>): number {
  const children = node.children ?? [];
  if (children.length === 0) return 0;
  return 1 + Math.max(...children.map(getDepth));
}

/**
 * Get the depth of a specific node from the root (0 = root).
 */
export function getNodeDepth<T>(roots: TreeNode<T>[], id: string): number {
  let found = -1;
  traverse(roots, 'depth-first-pre', (node, depth) => {
    if (node.id === id) found = depth;
  });
  return found;
}

/**
 * Count all nodes in the tree.
 */
export function countNodes<T>(roots: TreeNode<T>[]): number {
  let count = 0;
  traverse(roots, 'depth-first-pre', () => { count++; });
  return count;
}

/**
 * Compute aggregate statistics for a tree.
 */
export function getStats<T>(roots: TreeNode<T>[]): TreeStats {
  let totalNodes = 0;
  let maxDepth = 0;
  let leafCount = 0;
  let branchCount = 0;

  traverse(roots, 'depth-first-pre', (node, depth) => {
    totalNodes++;
    if (depth > maxDepth) maxDepth = depth;
    const childCount = (node.children ?? []).length;
    if (childCount === 0) leafCount++;
    else branchCount++;
  });

  return { totalNodes, maxDepth, leafCount, branchCount, rootCount: roots.length };
}

/**
 * Return true if ancestorId is an ancestor of descendantId.
 */
export function isAncestor<T>(
  roots: TreeNode<T>[],
  ancestorId: string,
  descendantId: string,
): boolean {
  const ancestorNode = findById(roots, ancestorId);
  if (!ancestorNode) return false;
  return findById([ancestorNode], descendantId) !== null && descendantId !== ancestorId;
}

/**
 * Return true if descendantId is a descendant of ancestorId.
 */
export function isDescendant<T>(
  roots: TreeNode<T>[],
  descendantId: string,
  ancestorId: string,
): boolean {
  return isAncestor(roots, ancestorId, descendantId);
}

// ─── Transformation ─────────────────────────────────────────────────────────

/**
 * Transform all node data, preserving tree structure.
 */
export function mapTree<T, U>(
  roots: TreeNode<T>[],
  transform: (node: TreeNode<T>) => U,
): TreeNode<U>[] {
  function mapNode(node: TreeNode<T>): TreeNode<U> {
    return {
      id: node.id,
      parentId: node.parentId,
      depth: node.depth,
      path: node.path,
      data: transform(node),
      children: (node.children ?? []).map(mapNode),
    };
  }
  return roots.map(mapNode);
}

/**
 * Filter nodes matching the predicate.
 * If keepAncestors is true, ancestor nodes are retained even if they don't match.
 */
export function filterTree<T>(
  roots: TreeNode<T>[],
  predicate: (node: TreeNode<T>) => boolean,
  keepAncestors = false,
): TreeNode<T>[] {
  function filterNode(node: TreeNode<T>): TreeNode<T> | null {
    const filteredChildren = (node.children ?? [])
      .map(filterNode)
      .filter((n): n is TreeNode<T> => n !== null);

    const matches = predicate(node);

    if (matches || (keepAncestors && filteredChildren.length > 0)) {
      return { ...node, children: filteredChildren };
    }
    return null;
  }

  return roots.map(filterNode).filter((n): n is TreeNode<T> => n !== null);
}

/**
 * Prune the tree to a maximum depth.
 */
export function pruneTree<T>(roots: TreeNode<T>[], maxDepth: number): TreeNode<T>[] {
  function prune(node: TreeNode<T>, currentDepth: number): TreeNode<T> {
    if (currentDepth >= maxDepth) {
      return { ...node, children: [] };
    }
    return {
      ...node,
      children: (node.children ?? []).map(c => prune(c, currentDepth + 1)),
    };
  }
  return roots.map(r => prune(r, 0));
}

/**
 * Merge two root arrays into one.
 */
export function mergeTree<T>(a: TreeNode<T>[], b: TreeNode<T>[]): TreeNode<T>[] {
  return [...a, ...b];
}

/**
 * Compute the diff between two tree states.
 */
export function diff<T>(before: TreeNode<T>[], after: TreeNode<T>[]): TreeDiff<T> {
  const beforeMap = new Map<string, TreeNode<T>>();
  const afterMap = new Map<string, TreeNode<T>>();

  traverse(before, 'depth-first-pre', node => beforeMap.set(node.id, node));
  traverse(after, 'depth-first-pre', node => afterMap.set(node.id, node));

  const added: TreeNode<T>[] = [];
  const removed: TreeNode<T>[] = [];
  const moved: Array<{ node: TreeNode<T>; oldParentId: string | null }> = [];
  const modified: Array<{ old: TreeNode<T>; new: TreeNode<T> }> = [];

  for (const [id, afterNode] of afterMap) {
    if (!beforeMap.has(id)) {
      added.push(afterNode);
    } else {
      const beforeNode = beforeMap.get(id)!;
      const oldParentId = beforeNode.parentId ?? null;
      const newParentId = afterNode.parentId ?? null;

      if (oldParentId !== newParentId) {
        moved.push({ node: afterNode, oldParentId });
      }

      const beforeData = JSON.stringify(beforeNode.data);
      const afterData = JSON.stringify(afterNode.data);
      if (beforeData !== afterData) {
        modified.push({ old: beforeNode, new: afterNode });
      }
    }
  }

  for (const [id, beforeNode] of beforeMap) {
    if (!afterMap.has(id)) {
      removed.push(beforeNode);
    }
  }

  return { added, removed, moved, modified };
}
