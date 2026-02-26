// Copyright (c) 2026 Nexara DMCC. All rights reserved.

/** Rope data structure for efficient string operations */
export interface RopeNode {
  weight: number;
  left: RopeNode | null;
  right: RopeNode | null;
  value: string | null;
}

function leaf(s: string): RopeNode {
  return { weight: s.length, left: null, right: null, value: s };
}

function concat(l: RopeNode, r: RopeNode): RopeNode {
  return { weight: l.weight, left: l, right: r, value: null };
}

function nodeLength(n: RopeNode | null): number {
  if (!n) return 0;
  if (n.value !== null) return n.value.length;
  return nodeLength(n.left) + nodeLength(n.right);
}

export class Rope {
  private root: RopeNode | null;

  constructor(s = '') {
    this.root = s.length > 0 ? leaf(s) : null;
  }

  get length(): number {
    return nodeLength(this.root);
  }

  toString(): string {
    return collectStr(this.root);
  }

  concat(other: Rope): Rope {
    const r = new Rope();
    if (this.root && other.root) {
      r.root = concat(this.root, other.root);
    } else {
      r.root = this.root ?? other.root ?? null;
    }
    return r;
  }

  charAt(index: number): string {
    if (index < 0 || index >= this.length) return '';
    return charAtNode(this.root, index);
  }

  split(index: number): [Rope, Rope] {
    const s = this.toString();
    const a = new Rope(s.slice(0, index));
    const b = new Rope(s.slice(index));
    return [a, b];
  }

  insert(index: number, s: string): Rope {
    const [left, right] = this.split(index);
    const mid = new Rope(s);
    return left.concat(mid).concat(right);
  }

  delete(start: number, end: number): Rope {
    const [left, rest] = this.split(start);
    const [, right] = rest.split(end - start);
    return left.concat(right);
  }

  slice(start: number, end?: number): string {
    const s = this.toString();
    return s.slice(start, end);
  }

  indexOf(sub: string): number {
    return this.toString().indexOf(sub);
  }

  report(start: number, end: number): string {
    return this.slice(start, end);
  }
}

function collectStr(n: RopeNode | null): string {
  if (!n) return '';
  if (n.value !== null) return n.value;
  return collectStr(n.left) + collectStr(n.right);
}

function charAtNode(n: RopeNode | null, i: number): string {
  if (!n) return '';
  if (n.value !== null) return n.value[i] ?? '';
  const lw = nodeLength(n.left);
  if (i < lw) return charAtNode(n.left, i);
  return charAtNode(n.right, i - lw);
}

export function createRope(s: string): Rope {
  return new Rope(s);
}

export function ropeFromParts(parts: string[]): Rope {
  return parts.reduce((acc, p) => acc.concat(new Rope(p)), new Rope());
}
