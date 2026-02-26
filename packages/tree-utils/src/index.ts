// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type {
  TreeNode,
  FlatNode,
  TreePath,
  TraverseOrder,
  TreeStats,
  TreeDiff,
  AncestorOptions,
  DescendantOptions,
} from './types';

export {
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
} from './tree-utils';
