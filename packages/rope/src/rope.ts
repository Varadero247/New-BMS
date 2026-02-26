// Copyright (c) 2026 Nexara DMCC. All rights reserved.

const LEAF_MAX = 16;

type RopeNode =
  | { kind: 'leaf'; value: string; weight: number }
  | { kind: 'internal'; left: RopeNode; right: RopeNode; weight: number };

function leafNode(value: string): RopeNode {
  return { kind: 'leaf', value, weight: value.length };
}

function internalNode(left: RopeNode, right: RopeNode): RopeNode {
  return { kind: 'internal', left, right, weight: nodeLength(left) };
}

function nodeLength(node: RopeNode): number {
  if (node.kind === 'leaf') return node.weight;
  return node.weight + nodeLength(node.right);
}

function nodeToString(node: RopeNode): string {
  if (node.kind === 'leaf') return node.value;
  return nodeToString(node.left) + nodeToString(node.right);
}

function nodeCharAt(node: RopeNode, index: number): string {
  if (node.kind === 'leaf') {
    return index < node.value.length ? node.value[index] : '';
  }
  if (index < node.weight) {
    return nodeCharAt(node.left, index);
  }
  return nodeCharAt(node.right, index - node.weight);
}

function nodeSplit(node: RopeNode, index: number): [RopeNode | null, RopeNode | null] {
  if (index <= 0) return [null, node];
  const len = nodeLength(node);
  if (index >= len) return [node, null];

  if (node.kind === 'leaf') {
    const left = node.value.slice(0, index);
    const right = node.value.slice(index);
    return [
      left.length > 0 ? leafNode(left) : null,
      right.length > 0 ? leafNode(right) : null,
    ];
  }

  if (index < node.weight) {
    const [ll, lr] = nodeSplit(node.left, index);
    const newRight = lr ? internalNode(lr, node.right) : node.right;
    return [ll, newRight];
  }
  if (index === node.weight) {
    return [node.left, node.right];
  }
  const [rl, rr] = nodeSplit(node.right, index - node.weight);
  const newLeft = rl ? internalNode(node.left, rl) : node.left;
  return [newLeft, rr];
}

function collectLeaves(node: RopeNode, leaves: string[]): void {
  if (node.kind === 'leaf') {
    leaves.push(node.value);
  } else {
    collectLeaves(node.left, leaves);
    collectLeaves(node.right, leaves);
  }
}

function buildBalanced(leaves: string[], start: number, end: number): RopeNode {
  if (start >= end) return leafNode('');
  if (end - start === 1) return leafNode(leaves[start]);
  const mid = Math.floor((start + end) / 2);
  return internalNode(buildBalanced(leaves, start, mid), buildBalanced(leaves, mid, end));
}

function rebalanceNode(node: RopeNode): RopeNode {
  const leaves: string[] = [];
  collectLeaves(node, leaves);
  const nonEmpty = leaves.filter((l) => l.length > 0);
  if (nonEmpty.length === 0) return leafNode('');
  // Further split large leaves
  const split: string[] = [];
  for (const l of nonEmpty) {
    if (l.length <= LEAF_MAX) {
      split.push(l);
    } else {
      for (let i = 0; i < l.length; i += LEAF_MAX) {
        split.push(l.slice(i, i + LEAF_MAX));
      }
    }
  }
  return buildBalanced(split, 0, split.length);
}

function buildFromString(s: string): RopeNode {
  if (s.length === 0) return leafNode('');
  if (s.length <= LEAF_MAX) return leafNode(s);
  const mid = Math.floor(s.length / 2);
  return internalNode(buildFromString(s.slice(0, mid)), buildFromString(s.slice(mid)));
}

function joinNodes(a: RopeNode | null, b: RopeNode | null): RopeNode {
  if (!a) return b ?? leafNode('');
  if (!b) return a;
  return internalNode(a, b);
}

export class Rope {
  private root: RopeNode;

  constructor(s: string = '') {
    this.root = buildFromString(s);
  }

  private constructor_internal(node: RopeNode) {
    this.root = node;
  }

  static _fromNode(node: RopeNode): Rope {
    const r = new Rope();
    r.root = node;
    return r;
  }

  get length(): number {
    return nodeLength(this.root);
  }

  toString(): string {
    return nodeToString(this.root);
  }

  charAt(index: number): string {
    if (index < 0 || index >= this.length) return '';
    return nodeCharAt(this.root, index);
  }

  substring(start: number, end: number): string {
    const len = this.length;
    const s = Math.max(0, Math.min(start, len));
    const e = Math.max(0, Math.min(end, len));
    if (s >= e) return '';
    const [, right] = nodeSplit(this.root, s);
    if (!right) return '';
    const [middle] = nodeSplit(right, e - s);
    return middle ? nodeToString(middle) : '';
  }

  concat(other: Rope): Rope {
    if (this.length === 0) return other;
    if (other.length === 0) return this;
    return Rope._fromNode(internalNode(this.root, other.root));
  }

  split(index: number): [Rope, Rope] {
    const len = this.length;
    const idx = Math.max(0, Math.min(index, len));
    const [left, right] = nodeSplit(this.root, idx);
    return [
      Rope._fromNode(left ?? leafNode('')),
      Rope._fromNode(right ?? leafNode('')),
    ];
  }

  insert(index: number, s: string): Rope {
    const len = this.length;
    const idx = Math.max(0, Math.min(index, len));
    const [left, right] = this.split(idx);
    const mid = new Rope(s);
    return left.concat(mid).concat(right);
  }

  delete(start: number, end: number): Rope {
    const len = this.length;
    const s = Math.max(0, Math.min(start, len));
    const e = Math.max(0, Math.min(end, len));
    if (s >= e) return this;
    const [left] = this.split(s);
    const [, right] = this.split(e);
    return left.concat(right);
  }

  indexOf(s: string): number {
    if (s.length === 0) return 0;
    return this.toString().indexOf(s);
  }

  static from(s: string): Rope {
    return new Rope(s);
  }

  static concat(...ropes: Rope[]): Rope {
    if (ropes.length === 0) return new Rope('');
    let result = ropes[0];
    for (let i = 1; i < ropes.length; i++) {
      result = result.concat(ropes[i]);
    }
    return result;
  }
}

export function ropeConcat(a: string, b: string): Rope {
  return new Rope(a).concat(new Rope(b));
}

export function ropeInsert(s: string, index: number, insert: string): string {
  return new Rope(s).insert(index, insert).toString();
}

export function ropeDelete(s: string, start: number, end: number): string {
  return new Rope(s).delete(start, end).toString();
}

export function ropeSubstring(s: string, start: number, end: number): string {
  return new Rope(s).substring(start, end);
}

export function rebalance(rope: Rope): Rope {
  return Rope._fromNode(rebalanceNode((rope as any).root));
}
