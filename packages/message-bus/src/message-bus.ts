// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

type Handler = (msg: unknown) => void;
type PatternHandler = (topic: string, msg: unknown) => void;

interface PatternEntry {
  pattern: string;
  handler: PatternHandler;
}

/**
 * Converts a wildcard pattern string to a RegExp.
 * - `**` matches any sequence of characters including `/`
 * - `*` matches any sequence of characters except `/`
 */
function patternToRegExp(pattern: string): RegExp {
  // Escape special regex chars except * which we handle manually
  const escaped = pattern.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&');
  // Replace ** first (before *), then replace * (single segment)
  const regexStr = escaped
    .replace(/\*\*/g, '\u0000') // placeholder for **
    .replace(/\*/g, '[^/]+')    // * = one segment (no slashes)
    .replace(/\u0000/g, '.*');  // ** = anything
  return new RegExp(`^${regexStr}$`);
}

export class MessageBus {
  private readonly _subscribers: Map<string, Set<Handler>> = new Map();
  private readonly _patternSubscribers: PatternEntry[] = [];

  /**
   * Subscribe to an exact topic.
   * Returns an unsubscribe function.
   */
  subscribe(topic: string, handler: Handler): () => void {
    if (!this._subscribers.has(topic)) {
      this._subscribers.set(topic, new Set());
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._subscribers.get(topic)!.add(handler);

    return () => {
      const handlers = this._subscribers.get(topic);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this._subscribers.delete(topic);
        }
      }
    };
  }

  /**
   * Publish a message to a topic.
   * Returns the number of subscribers notified.
   */
  publish(topic: string, message: unknown): number {
    let count = 0;

    const handlers = this._subscribers.get(topic);
    if (handlers) {
      // Snapshot to handle once()-style mid-iteration removal
      const snapshot = Array.from(handlers);
      for (const handler of snapshot) {
        handler(message);
        count++;
      }
    }

    // Notify pattern subscribers
    for (const entry of this._patternSubscribers) {
      const re = patternToRegExp(entry.pattern);
      if (re.test(topic)) {
        entry.handler(topic, message);
        count++;
      }
    }

    return count;
  }

  /**
   * Remove all handlers for a given topic, or all topics if no topic provided.
   */
  unsubscribeAll(topic?: string): void {
    if (topic === undefined) {
      this._subscribers.clear();
      this._patternSubscribers.length = 0;
    } else {
      this._subscribers.delete(topic);
    }
  }

  /**
   * Returns the number of subscribers for an exact topic.
   */
  subscriberCount(topic: string): number {
    return this._subscribers.get(topic)?.size ?? 0;
  }

  /**
   * Returns all topics that currently have at least one subscriber.
   */
  topics(): string[] {
    return Array.from(this._subscribers.keys());
  }

  /**
   * Subscribe to a topic but fire only once, then auto-unsubscribe.
   * Returns an unsubscribe function that can cancel before the first fire.
   */
  once(topic: string, handler: Handler): () => void {
    let unsub: (() => void) | null = null;
    const wrapper: Handler = (msg) => {
      if (unsub) {
        unsub();
        unsub = null;
      }
      handler(msg);
    };
    unsub = this.subscribe(topic, wrapper);
    // Return a cancel function
    return () => {
      if (unsub) {
        unsub();
        unsub = null;
      }
    };
  }

  /**
   * Subscribe using a wildcard pattern.
   * - `*` matches any single path segment (no `/`)
   * - `**` matches any path (including `/`)
   * Returns an unsubscribe function.
   */
  subscribePattern(pattern: string, handler: PatternHandler): () => void {
    const entry: PatternEntry = { pattern, handler };
    this._patternSubscribers.push(entry);

    return () => {
      const idx = this._patternSubscribers.indexOf(entry);
      if (idx !== -1) {
        this._patternSubscribers.splice(idx, 1);
      }
    };
  }
}

/**
 * Factory function — returns a new MessageBus instance.
 */
export function createBus(): MessageBus {
  return new MessageBus();
}
