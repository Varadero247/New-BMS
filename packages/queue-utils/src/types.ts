// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/** A generic item stored in a queue with optional metadata. */
export interface QueueItem<T> {
  value: T;
  enqueuedAt: number;
  id?: string;
}

/** An item stored in a priority queue, pairing a value with its numeric priority. */
export interface PriorityItem<T> {
  value: T;
  priority: number;
}

/** A node in a doubly-linked list used by the Deque implementation. */
export interface DequeNode<T> {
  value: T;
  prev: DequeNode<T> | null;
  next: DequeNode<T> | null;
}

/** Runtime statistics snapshot for a CircularBuffer. */
export interface CircularBufferStats {
  capacity: number;
  size: number;
  isFull: boolean;
  isEmpty: boolean;
  totalWritten: number;
  totalRead: number;
  droppedWrites: number;
}

/** Heap ordering mode for a PriorityQueue. */
export type HeapType = 'min' | 'max';

/** Runtime statistics snapshot for a Queue. */
export interface QueueStats {
  size: number;
  totalEnqueued: number;
  totalDequeued: number;
  isEmpty: boolean;
}
