// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

function simpleHash(data: string): string {
  let h = 0;
  for (let i = 0; i < data.length; i++) {
    h = (h * 31 + data.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function combineHash(a: string, b: string): string {
  return simpleHash(a + b);
}

export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  data?: string;
}

export class MerkleTree {
  private _leaves: string[];
  private _leafHashes: string[];
  private _nodes: string[][];   // levels[0] = leaf layer, levels[top] = root
  private _height: number;

  constructor(leaves: string[]) {
    if (leaves.length === 0) {
      this._leaves = [];
      this._leafHashes = [];
      this._nodes = [['']];
      this._height = 0;
      return;
    }
    this._leaves = [...leaves];
    this._leafHashes = leaves.map(l => simpleHash(l));
    this._nodes = this._buildTree(this._leafHashes);
    this._height = this._nodes.length - 1;
  }

  private _buildTree(leafHashes: string[]): string[][] {
    if (leafHashes.length === 0) return [['']];
    const levels: string[][] = [leafHashes.slice()];
    let current = leafHashes.slice();
    while (current.length > 1) {
      const next: string[] = [];
      for (let i = 0; i < current.length; i += 2) {
        const left = current[i];
        const right = i + 1 < current.length ? current[i + 1] : current[i];
        next.push(combineHash(left, right));
      }
      levels.push(next);
      current = next;
    }
    return levels;
  }

  get root(): string {
    const top = this._nodes[this._nodes.length - 1];
    return top[0] ?? '';
  }

  get leaves(): string[] {
    return [...this._leaves];
  }

  get leafCount(): number {
    return this._leaves.length;
  }

  get height(): number {
    return this._height;
  }

  getLeafHash(index: number): string {
    if (index < 0 || index >= this._leafHashes.length) {
      throw new RangeError(`Index ${index} out of bounds`);
    }
    return this._leafHashes[index];
  }

  getProof(index: number): Array<{ hash: string; position: 'left' | 'right' }> {
    if (this._leaves.length === 0) return [];
    if (index < 0 || index >= this._leaves.length) {
      throw new RangeError(`Index ${index} out of bounds`);
    }
    const proof: Array<{ hash: string; position: 'left' | 'right' }> = [];
    let idx = index;
    for (let level = 0; level < this._nodes.length - 1; level++) {
      const layer = this._nodes[level];
      const isRight = idx % 2 === 1;
      const siblingIdx = isRight ? idx - 1 : idx + 1;
      const sibling = siblingIdx < layer.length ? layer[siblingIdx] : layer[idx];
      proof.push({
        hash: sibling,
        position: isRight ? 'left' : 'right',
      });
      idx = Math.floor(idx / 2);
    }
    return proof;
  }

  verify(leaf: string, index: number, proof: Array<{ hash: string; position: 'left' | 'right' }>): boolean {
    if (this._leaves.length === 0) return false;
    return verifyMerkleProof(this.root, leaf, proof);
  }

  update(index: number, newLeaf: string): void {
    if (index < 0 || index >= this._leaves.length) {
      throw new RangeError(`Index ${index} out of bounds`);
    }
    this._leaves[index] = newLeaf;
    this._leafHashes[index] = simpleHash(newLeaf);
    this._nodes = this._buildTree(this._leafHashes);
    this._height = this._nodes.length - 1;
  }
}

export function verifyMerkleProof(
  rootHash: string,
  leaf: string,
  proof: Array<{ hash: string; position: 'left' | 'right' }>
): boolean {
  let hash = simpleHash(leaf);
  for (const step of proof) {
    if (step.position === 'left') {
      hash = combineHash(step.hash, hash);
    } else {
      hash = combineHash(hash, step.hash);
    }
  }
  return hash === rootHash;
}
