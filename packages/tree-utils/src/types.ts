// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface TreeNode<T = Record<string, unknown>> {
  id: string;
  parentId?: string | null;
  children?: TreeNode<T>[];
  data: T;
  depth?: number;
  path?: string[];
}

export interface FlatNode<T = Record<string, unknown>> {
  id: string;
  parentId?: string | null;
  data: T;
}

export type TreePath = string[];

export type TraverseOrder = 'breadth-first' | 'depth-first-pre' | 'depth-first-post';

export interface TreeStats {
  totalNodes: number;
  maxDepth: number;
  leafCount: number;
  branchCount: number;
  rootCount: number;
}

export interface TreeDiff<T = Record<string, unknown>> {
  added: TreeNode<T>[];
  removed: TreeNode<T>[];
  moved: Array<{ node: TreeNode<T>; oldParentId: string | null }>;
  modified: Array<{ old: TreeNode<T>; new: TreeNode<T> }>;
}

export interface AncestorOptions {
  includeSelf?: boolean;
}

export interface DescendantOptions {
  maxDepth?: number;
  includeSelf?: boolean;
}
