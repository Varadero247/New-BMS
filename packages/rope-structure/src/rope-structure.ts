// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

// ---------------------------------------------------------------------------
// RopeNode — internal node of the Rope binary tree
// ---------------------------------------------------------------------------

export interface RopeNode {
  left?: RopeNode;
  right?: RopeNode;
  value?: string;
  weight: number;
}

function makeLeaf(value: string): RopeNode {
  return { value, weight: value.length };
}

function makeInternal(left: RopeNode, right: RopeNode): RopeNode {
  return { left, right, weight: treeWeight(left) };
}

/** Returns the total character length of a subtree. */
function treeLength(node: RopeNode | undefined): number {
  if (!node) return 0;
  if (node.value !== undefined) return node.value.length;
  return treeLength(node.left) + treeLength(node.right);
}

/** Returns the weight of a node (used for index navigation). */
function treeWeight(node: RopeNode | undefined): number {
  if (!node) return 0;
  return treeLength(node);
}

/** Concatenate the full string from all leaves. */
function collectString(node: RopeNode | undefined): string {
  if (!node) return '';
  if (node.value !== undefined) return node.value;
  return collectString(node.left) + collectString(node.right);
}

/** Retrieve character at absolute index i within the subtree. */
function indexChar(node: RopeNode | undefined, i: number): string {
  if (!node) return '';
  if (node.value !== undefined) {
    if (i < 0 || i >= node.value.length) return '';
    return node.value[i];
  }
  const leftLen = treeLength(node.left);
  if (i < leftLen) {
    return indexChar(node.left, i);
  }
  return indexChar(node.right, i - leftLen);
}

/**
 * Split a rope node at position `index`, returning [leftNode, rightNode].
 * leftNode covers [0, index), rightNode covers [index, end).
 */
function splitNode(
  node: RopeNode | undefined,
  index: number,
): [RopeNode | undefined, RopeNode | undefined] {
  if (!node) return [undefined, undefined];

  if (node.value !== undefined) {
    const left = index > 0 ? makeLeaf(node.value.slice(0, index)) : undefined;
    const right =
      index < node.value.length ? makeLeaf(node.value.slice(index)) : undefined;
    return [left, right];
  }

  const leftLen = treeLength(node.left);
  if (index === leftLen) {
    return [node.left, node.right];
  }
  if (index < leftLen) {
    const [ll, lr] = splitNode(node.left, index);
    const newRight = concatNodes(lr, node.right);
    return [ll, newRight];
  }
  // index > leftLen
  const [rl, rr] = splitNode(node.right, index - leftLen);
  const newLeft = concatNodes(node.left, rl);
  return [newLeft, rr];
}

/** Concatenate two optional rope nodes. */
function concatNodes(
  a: RopeNode | undefined,
  b: RopeNode | undefined,
): RopeNode | undefined {
  if (!a) return b;
  if (!b) return a;
  return makeInternal(a, b);
}

/** Depth of a rope node tree. */
function nodeDepth(node: RopeNode | undefined): number {
  if (!node) return 0;
  if (node.value !== undefined) return 1;
  return 1 + Math.max(nodeDepth(node.left), nodeDepth(node.right));
}

/** Count leaf nodes. */
function nodeLeafCount(node: RopeNode | undefined): number {
  if (!node) return 0;
  if (node.value !== undefined) return 1;
  return nodeLeafCount(node.left) + nodeLeafCount(node.right);
}

/** Collect all leaves into an array. */
function collectLeaves(node: RopeNode | undefined, leaves: string[]): void {
  if (!node) return;
  if (node.value !== undefined) {
    leaves.push(node.value);
    return;
  }
  collectLeaves(node.left, leaves);
  collectLeaves(node.right, leaves);
}

/**
 * Build a balanced rope tree from an array of leaf strings.
 * Uses divide-and-conquer to keep height O(log n).
 */
function buildBalanced(leaves: string[]): RopeNode | undefined {
  if (leaves.length === 0) return undefined;
  if (leaves.length === 1) return makeLeaf(leaves[0]);
  const mid = Math.floor(leaves.length / 2);
  const left = buildBalanced(leaves.slice(0, mid));
  const right = buildBalanced(leaves.slice(mid));
  return concatNodes(left, right);
}

// ---------------------------------------------------------------------------
// Rope — public class
// ---------------------------------------------------------------------------

/**
 * Rope: a binary tree data structure for efficient string manipulation.
 *
 * Characteristics:
 *  - concat: O(1)
 *  - charAt: O(log n)
 *  - split: O(log n)
 *  - insert/delete: O(log n)
 *  - rebalance: O(n)
 */
export class Rope {
  private root: RopeNode | undefined;

  constructor(s?: string) {
    if (s !== undefined && s.length > 0) {
      this.root = makeLeaf(s);
    } else {
      this.root = undefined;
    }
  }

  // --- Static factories ---

  static fromString(s: string): Rope {
    const r = new Rope();
    if (s.length > 0) {
      r.root = makeLeaf(s);
    }
    return r;
  }

  static empty(): Rope {
    return new Rope();
  }

  // Used internally to create a Rope wrapping an existing node.
  private static fromNode(node: RopeNode | undefined): Rope {
    const r = new Rope();
    r.root = node;
    return r;
  }

  // --- Core properties ---

  get length(): number {
    return treeLength(this.root);
  }

  // --- String conversion ---

  toString(): string {
    return collectString(this.root);
  }

  // --- charAt ---

  charAt(index: number): string {
    if (index < 0 || index >= this.length) return '';
    return indexChar(this.root, index);
  }

  // --- concat ---

  /** O(1) join — creates a new internal node above both roots. */
  concat(other: Rope): Rope {
    if (!this.root) return other;
    if (!other.root) return this;
    return Rope.fromNode(concatNodes(this.root, other.root));
  }

  // --- split ---

  /** Split at `index` → [rope covering [0,index), rope covering [index,end)]. */
  split(index: number): [Rope, Rope] {
    const clampedIndex = Math.max(0, Math.min(index, this.length));
    const [l, r] = splitNode(this.root, clampedIndex);
    return [Rope.fromNode(l), Rope.fromNode(r)];
  }

  // --- insert ---

  /** Insert string `s` at position `index`. */
  insert(index: number, s: string): Rope {
    if (s.length === 0) return this;
    const clampedIndex = Math.max(0, Math.min(index, this.length));
    const [left, right] = this.split(clampedIndex);
    const middle = Rope.fromString(s);
    return left.concat(middle).concat(right);
  }

  // --- delete ---

  /** Remove characters in the range [start, end). */
  delete(start: number, end: number): Rope {
    const len = this.length;
    const s = Math.max(0, Math.min(start, len));
    const e = Math.max(s, Math.min(end, len));
    if (s === e) return this;
    const [left] = this.split(s);
    const [, right] = this.split(e);
    return left.concat(right);
  }

  // --- substring ---

  /** Extract substring [start, end). */
  substring(start: number, end: number): string {
    const len = this.length;
    const s = Math.max(0, Math.min(start, len));
    const e = Math.max(s, Math.min(end, len));
    if (s === e) return '';
    const [, afterStart] = this.split(s);
    const [middle] = afterStart.split(e - s);
    return middle.toString();
  }

  // --- indexOf ---

  /** Find first occurrence of substring `s` (-1 if not found). */
  indexOf(s: string): number {
    if (s.length === 0) return 0;
    const full = this.toString();
    return full.indexOf(s);
  }

  // --- rebalance ---

  /** Rebalance the rope to a balanced binary tree. */
  rebalance(): Rope {
    if (!this.root) return Rope.empty();
    const leaves: string[] = [];
    collectLeaves(this.root, leaves);
    const nonEmpty = leaves.filter((l) => l.length > 0);
    if (nonEmpty.length === 0) return Rope.empty();
    return Rope.fromNode(buildBalanced(nonEmpty));
  }

  // --- depth ---

  depth(): number {
    return nodeDepth(this.root);
  }

  // --- leafCount ---

  leafCount(): number {
    return nodeLeafCount(this.root);
  }
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/** Concatenate multiple Rope objects left-to-right. */
export function ropeConcat(...ropes: Rope[]): Rope {
  return ropes.reduce((acc, r) => acc.concat(r), Rope.empty());
}

/** Build a Rope from an array of strings. */
export function ropeFromArray(arr: string[]): Rope {
  return ropeConcat(...arr.map((s) => Rope.fromString(s)));
}

// ---------------------------------------------------------------------------
// PieceTable — alternative string editing structure
// ---------------------------------------------------------------------------

type PieceBuffer = 'original' | 'add';

interface Piece {
  buffer: PieceBuffer;
  start: number;
  length: number;
}

/**
 * PieceTable: efficient text editor buffer.
 *
 * Maintains the original buffer unchanged; all edits append to the "add"
 * buffer and reorganise the piece list.
 */
export class PieceTable {
  private originalBuffer: string;
  private addBuffer: string;
  private pieces: Piece[];

  constructor(original: string) {
    this.originalBuffer = original;
    this.addBuffer = '';
    this.pieces =
      original.length > 0
        ? [{ buffer: 'original', start: 0, length: original.length }]
        : [];
  }

  // --- helpers ---

  private bufferText(piece: Piece): string {
    const buf =
      piece.buffer === 'original' ? this.originalBuffer : this.addBuffer;
    return buf.slice(piece.start, piece.start + piece.length);
  }

  private charAtOffset(offset: number): { pieceIndex: number; localOffset: number } | null {
    let remaining = offset;
    for (let i = 0; i < this.pieces.length; i++) {
      if (remaining < this.pieces[i].length) {
        return { pieceIndex: i, localOffset: remaining };
      }
      remaining -= this.pieces[i].length;
    }
    return null;
  }

  // --- public API ---

  get length(): number {
    return this.pieces.reduce((sum, p) => sum + p.length, 0);
  }

  getText(): string {
    return this.pieces.map((p) => this.bufferText(p)).join('');
  }

  insert(offset: number, text: string): void {
    if (text.length === 0) return;
    const clampedOffset = Math.max(0, Math.min(offset, this.length));

    // Append text to add buffer
    const addStart = this.addBuffer.length;
    this.addBuffer += text;
    const newPiece: Piece = { buffer: 'add', start: addStart, length: text.length };

    // Find where to split
    let remaining = clampedOffset;
    let insertAt = this.pieces.length; // default: append at end

    for (let i = 0; i < this.pieces.length; i++) {
      const piece = this.pieces[i];
      if (remaining === 0) {
        insertAt = i;
        remaining = -1; // signal: no split needed
        break;
      }
      if (remaining < piece.length) {
        // Split this piece
        const leftPiece: Piece = { buffer: piece.buffer, start: piece.start, length: remaining };
        const rightPiece: Piece = {
          buffer: piece.buffer,
          start: piece.start + remaining,
          length: piece.length - remaining,
        };
        this.pieces.splice(i, 1, leftPiece, newPiece, rightPiece);
        return;
      }
      remaining -= piece.length;
      if (remaining === 0) {
        insertAt = i + 1;
        remaining = -1;
        break;
      }
    }

    // Insert at boundary (no split needed)
    this.pieces.splice(insertAt, 0, newPiece);
  }

  delete(offset: number, length: number): void {
    if (length <= 0) return;
    const totalLen = this.length;
    const start = Math.max(0, Math.min(offset, totalLen));
    const end = Math.min(start + length, totalLen);
    const deleteLen = end - start;
    if (deleteLen <= 0) return;

    let remaining = deleteLen;
    let pos = start;

    // Find piece containing `start`
    let accumulated = 0;
    let i = 0;
    while (i < this.pieces.length && accumulated + this.pieces[i].length <= pos) {
      accumulated += this.pieces[i].length;
      i++;
    }

    while (remaining > 0 && i < this.pieces.length) {
      const piece = this.pieces[i];
      const localOffset = pos - accumulated;
      const available = piece.length - localOffset;

      if (localOffset === 0 && remaining >= piece.length) {
        // Delete entire piece
        remaining -= piece.length;
        this.pieces.splice(i, 1);
        // Don't advance i; next piece now at i
      } else if (localOffset === 0) {
        // Delete from start of piece
        this.pieces[i] = {
          buffer: piece.buffer,
          start: piece.start + remaining,
          length: piece.length - remaining,
        };
        remaining = 0;
      } else if (localOffset + remaining >= piece.length) {
        // Delete to end of piece
        const toDelete = available;
        this.pieces[i] = {
          buffer: piece.buffer,
          start: piece.start,
          length: localOffset,
        };
        remaining -= toDelete;
        accumulated += piece.length;
        pos = accumulated; // advance pos to start of next piece
        i++;
      } else {
        // Delete middle of piece → split into two
        const leftPiece: Piece = {
          buffer: piece.buffer,
          start: piece.start,
          length: localOffset,
        };
        const rightPiece: Piece = {
          buffer: piece.buffer,
          start: piece.start + localOffset + remaining,
          length: piece.length - localOffset - remaining,
        };
        this.pieces.splice(i, 1, leftPiece, rightPiece);
        remaining = 0;
      }
    }
  }
}
