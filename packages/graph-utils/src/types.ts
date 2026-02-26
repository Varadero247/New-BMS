// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface GraphNode<T = unknown> {
  id: string;
  data?: T;
}

export interface GraphEdge<T = unknown> {
  from: string;
  to: string;
  weight?: number;
  data?: T;
}

export interface Graph<N = unknown, E = unknown> {
  nodes: Map<string, GraphNode<N>>;
  edges: GraphEdge<E>[];
  directed: boolean;
}

export interface ShortestPathResult {
  path: string[];
  distance: number;
  found: boolean;
}

export interface SCCResult {
  components: string[][];
  nodeToComponent: Map<string, number>;
}

export interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  isConnected: boolean;
  hasCycles: boolean;
  density: number;
  averageDegree: number;
  diameter?: number;
}

export interface TopologicalResult {
  order: string[];
  hasCycle: boolean;
}

export type TraversalCallback<N> = (node: GraphNode<N>, depth: number, parent?: string) => void;
