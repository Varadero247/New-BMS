// Copyright (c) 2026 Nexara DMCC. All rights reserved.

interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
  count: number;
}

function newNode(): TrieNode { return { children: new Map(), isEnd: false, count: 0 }; }

export class Trie {
  private root: TrieNode = newNode();
  private _size = 0;

  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, newNode());
      node = node.children.get(ch)!;
      node.count++;
    }
    if (!node.isEnd) { node.isEnd = true; this._size++; }
  }

  search(word: string): boolean {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) return false;
      node = node.children.get(ch)!;
    }
    return node.isEnd;
  }

  startsWith(prefix: string): boolean {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children.has(ch)) return false;
      node = node.children.get(ch)!;
    }
    return true;
  }

  delete(word: string): boolean {
    if (!this.search(word)) return false;
    this._delete(this.root, word, 0);
    this._size--;
    return true;
  }

  private _delete(node: TrieNode, word: string, depth: number): boolean {
    if (depth === word.length) { node.isEnd = false; return node.children.size === 0; }
    const ch = word[depth];
    const child = node.children.get(ch);
    if (!child) return false;
    const shouldDelete = this._delete(child, word, depth + 1);
    if (shouldDelete) node.children.delete(ch);
    return !node.isEnd && node.children.size === 0;
  }

  autocomplete(prefix: string, limit = 10): string[] {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children.has(ch)) return [];
      node = node.children.get(ch)!;
    }
    const results: string[] = [];
    this._collect(node, prefix, results, limit);
    return results;
  }

  private _collect(node: TrieNode, prefix: string, results: string[], limit: number): void {
    if (results.length >= limit) return;
    if (node.isEnd) results.push(prefix);
    for (const [ch, child] of node.children) this._collect(child, prefix + ch, results, limit);
  }

  countWordsWithPrefix(prefix: string): number {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children.has(ch)) return 0;
      node = node.children.get(ch)!;
    }
    return this._countWords(node);
  }

  private _countWords(node: TrieNode): number {
    let count = node.isEnd ? 1 : 0;
    for (const child of node.children.values()) count += this._countWords(child);
    return count;
  }

  get size(): number { return this._size; }

  allWords(): string[] {
    const results: string[] = [];
    this._collect(this.root, '', results, Infinity);
    return results;
  }

  longestCommonPrefix(): string {
    let node = this.root;
    let prefix = '';
    while (node.children.size === 1 && !node.isEnd) {
      const [ch, child] = node.children.entries().next().value;
      prefix += ch; node = child;
    }
    return prefix;
  }
}

export function createTrie(): Trie { return new Trie(); }

export function buildTrie(words: string[]): Trie {
  const t = new Trie();
  for (const w of words) t.insert(w);
  return t;
}
