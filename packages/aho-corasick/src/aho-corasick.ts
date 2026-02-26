// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export interface Match {
  pattern: string;
  start: number;
  end: number;
}

interface TrieNode {
  children: Map<string, TrieNode>;
  fail: TrieNode | null;
  output: string[];
  id: number;
}

export class AhoCorasick {
  private root: TrieNode;
  private nodeCount = 0;
  private patterns: string[] = [];
  private built = false;

  constructor() {
    this.root = this.newNode();
  }

  private newNode(): TrieNode {
    return { children: new Map(), fail: null, output: [], id: this.nodeCount++ };
  }

  addPattern(pattern: string): void {
    if (!pattern) return;
    this.built = false;
    let node = this.root;
    for (const ch of pattern) {
      if (!node.children.has(ch)) {
        node.children.set(ch, this.newNode());
      }
      node = node.children.get(ch)!;
    }
    node.output.push(pattern);
    this.patterns.push(pattern);
  }

  build(): void {
    const queue: TrieNode[] = [];
    for (const child of this.root.children.values()) {
      child.fail = this.root;
      queue.push(child);
    }
    let i = 0;
    while (i < queue.length) {
      const curr = queue[i++];
      for (const [ch, child] of curr.children) {
        let fail = curr.fail;
        while (fail && !fail.children.has(ch)) fail = fail.fail;
        child.fail = fail ? fail.children.get(ch)! : this.root;
        if (child.fail === child) child.fail = this.root;
        child.output = [...child.output, ...child.fail.output];
        queue.push(child);
      }
    }
    this.built = true;
  }

  search(text: string): Match[] {
    if (!this.built) this.build();
    const results: Match[] = [];
    // Use [...text] to iterate by Unicode code points (handles surrogates correctly)
    const chars = [...text];
    let node = this.root;
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      while (node !== this.root && !node.children.has(ch)) node = node.fail!;
      if (node.children.has(ch)) node = node.children.get(ch)!;
      for (const pat of node.output) {
        const patLen = [...pat].length;
        results.push({ pattern: pat, start: i - patLen + 1, end: i });
      }
    }
    return results;
  }

  searchFirst(text: string): Match | null {
    const results = this.search(text);
    return results.length > 0 ? results[0] : null;
  }

  containsAny(text: string): boolean {
    return this.search(text).length > 0;
  }

  get patternCount(): number { return this.patterns.length; }
  get nodeCountValue(): number { return this.nodeCount; }

  clear(): void {
    this.nodeCount = 0;
    this.root = this.newNode();
    this.patterns = [];
    this.built = false;
  }
}

export function createAhoCorasick(patterns: string[] = []): AhoCorasick {
  const ac = new AhoCorasick();
  for (const p of patterns) ac.addPattern(p);
  if (patterns.length > 0) ac.build();
  return ac;
}

export function searchAll(text: string, patterns: string[]): Match[] {
  return createAhoCorasick(patterns).search(text);
}

export function countOccurrences(text: string, patterns: string[]): Map<string, number> {
  const matches = searchAll(text, patterns);
  const counts = new Map<string, number>();
  for (const m of matches) counts.set(m.pattern, (counts.get(m.pattern) ?? 0) + 1);
  return counts;
}
