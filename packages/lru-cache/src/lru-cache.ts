// Copyright (c) 2026 Nexara DMCC. All rights reserved.

interface LRUNode<K, V> { key: K; value: V; prev: LRUNode<K,V> | null; next: LRUNode<K,V> | null; }

export class LRUCache<K, V> {
  private capacity: number;
  private map: Map<K, LRUNode<K,V>> = new Map();
  private head: LRUNode<K,V> | null = null;
  private tail: LRUNode<K,V> | null = null;
  private _hits = 0;
  private _misses = 0;

  constructor(capacity: number) {
    if (capacity <= 0) throw new Error('Capacity must be > 0');
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) { this._misses++; return undefined; }
    this._hits++;
    this.moveToFront(node);
    return node.value;
  }

  put(key: K, value: V): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      node.value = value;
      this.moveToFront(node);
    } else {
      const node: LRUNode<K,V> = { key, value, prev: null, next: null };
      this.map.set(key, node);
      this.addToFront(node);
      if (this.map.size > this.capacity) this.removeLRU();
    }
  }

  has(key: K): boolean { return this.map.has(key); }
  get size(): number { return this.map.size; }
  get maxSize(): number { return this.capacity; }
  get hitRate(): number { return this._hits + this._misses === 0 ? 0 : this._hits / (this._hits + this._misses); }

  delete(key: K): boolean {
    const node = this.map.get(key);
    if (!node) return false;
    this.removeNode(node);
    this.map.delete(key);
    return true;
  }

  clear(): void { this.map.clear(); this.head = null; this.tail = null; }

  keys(): K[] {
    const result: K[] = [];
    let n = this.head;
    while (n) { result.push(n.key); n = n.next; }
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    let n = this.head;
    while (n) { result.push(n.value); n = n.next; }
    return result;
  }

  peek(key: K): V | undefined { return this.map.get(key)?.value; }

  private addToFront(node: LRUNode<K,V>): void {
    node.next = this.head; node.prev = null;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
  }

  private removeNode(node: LRUNode<K,V>): void {
    if (node.prev) node.prev.next = node.next; else this.head = node.next;
    if (node.next) node.next.prev = node.prev; else this.tail = node.prev;
  }

  private moveToFront(node: LRUNode<K,V>): void { this.removeNode(node); this.addToFront(node); }

  private removeLRU(): void {
    if (!this.tail) return;
    this.map.delete(this.tail.key);
    this.removeNode(this.tail);
  }
}

export function createLRUCache<K, V>(capacity: number): LRUCache<K, V> { return new LRUCache<K, V>(capacity); }
