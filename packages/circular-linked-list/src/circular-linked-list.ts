// Copyright (c) 2026 Nexara DMCC. All rights reserved.

interface CLLNode<T> { value: T; next: CLLNode<T>; }

export class CircularLinkedList<T> {
  private head: CLLNode<T> | null = null;
  private _size = 0;

  get size(): number { return this._size; }
  get isEmpty(): boolean { return this._size === 0; }

  append(value: T): void {
    const node: CLLNode<T> = { value, next: null as any };
    if (!this.head) { node.next = node; this.head = node; }
    else {
      let tail = this.head;
      while (tail.next !== this.head) tail = tail.next;
      tail.next = node; node.next = this.head;
    }
    this._size++;
  }

  prepend(value: T): void {
    const node: CLLNode<T> = { value, next: null as any };
    if (!this.head) { node.next = node; this.head = node; }
    else {
      let tail = this.head;
      while (tail.next !== this.head) tail = tail.next;
      node.next = this.head; tail.next = node; this.head = node;
    }
    this._size++;
  }

  removeFirst(): T | undefined {
    if (!this.head) return undefined;
    const val = this.head.value;
    if (this._size === 1) { this.head = null; }
    else {
      let tail = this.head;
      while (tail.next !== this.head) tail = tail.next;
      this.head = this.head.next; tail.next = this.head;
    }
    this._size--;
    return val;
  }

  removeLast(): T | undefined {
    if (!this.head) return undefined;
    if (this._size === 1) { const v = this.head.value; this.head = null; this._size--; return v; }
    let prev = this.head;
    while (prev.next.next !== this.head) prev = prev.next;
    const val = prev.next.value;
    prev.next = this.head;
    this._size--;
    return val;
  }

  peekFirst(): T | undefined { return this.head?.value; }
  peekLast(): T | undefined {
    if (!this.head) return undefined;
    let n = this.head;
    while (n.next !== this.head) n = n.next;
    return n.value;
  }

  contains(value: T): boolean {
    if (!this.head) return false;
    let n = this.head;
    do { if (n.value === value) return true; n = n.next; } while (n !== this.head);
    return false;
  }

  remove(value: T): boolean {
    if (!this.head) return false;
    if (this.head.value === value) { this.removeFirst(); return true; }
    let prev = this.head;
    while (prev.next !== this.head) {
      if (prev.next.value === value) {
        prev.next = prev.next.next;
        this._size--;
        return true;
      }
      prev = prev.next;
    }
    return false;
  }

  at(index: number): T | undefined {
    if (index < 0 || index >= this._size || !this.head) return undefined;
    let n = this.head;
    for (let i = 0; i < index; i++) n = n.next;
    return n.value;
  }

  toArray(): T[] {
    if (!this.head) return [];
    const result: T[] = [];
    let n = this.head;
    do { result.push(n.value); n = n.next; } while (n !== this.head);
    return result;
  }

  rotate(steps: number): void {
    if (this._size <= 1) return;
    const s = ((steps % this._size) + this._size) % this._size;
    for (let i = 0; i < s; i++) { this.head = this.head!.next; }
  }

  reverse(): void {
    if (this._size <= 1) return;
    const arr = this.toArray().reverse();
    this.clear();
    for (const v of arr) this.append(v);
  }

  clear(): void { this.head = null; this._size = 0; }

  [Symbol.iterator](): Iterator<T> {
    let current = this.head;
    let count = 0;
    const size = this._size;
    return {
      next(): IteratorResult<T> {
        if (count++ < size) {
          const v = current!.value;
          current = current!.next;
          return { value: v, done: false };
        }
        return { value: undefined as any, done: true };
      }
    };
  }
}

export function createCircularLinkedList<T>(): CircularLinkedList<T> {
  return new CircularLinkedList<T>();
}

export function fromArray<T>(arr: T[]): CircularLinkedList<T> {
  const list = new CircularLinkedList<T>();
  for (const v of arr) list.append(v);
  return list;
}
