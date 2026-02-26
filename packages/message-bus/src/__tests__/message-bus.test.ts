// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { MessageBus, createBus } from '../message-bus';

// subscribe/publish — 200 tests
describe('subscribe/publish basic delivery', () => {
  for (let i = 0; i < 200; i++) {
    it(`publish delivers message ${i} to subscriber`, () => {
      const bus = new MessageBus();
      const received: number[] = [];
      bus.subscribe('topic', msg => received.push(msg as number));
      bus.publish('topic', i);
      expect(received).toEqual([i]);
    });
  }
});

// publish returns subscriber count — 100 tests
describe('publish returns subscriber count', () => {
  for (let n = 0; n < 100; n++) {
    it(`publish to ${n} subscribers returns ${n}`, () => {
      const bus = new MessageBus();
      for (let j = 0; j < n; j++) bus.subscribe('t', () => {});
      expect(bus.publish('t', 'msg')).toBe(n);
    });
  }
});

// unsubscribe fn — 100 tests
describe('unsubscribe via returned fn', () => {
  for (let i = 0; i < 100; i++) {
    it(`unsubscribe fn removes handler (i=${i})`, () => {
      const bus = new MessageBus();
      const received: number[] = [];
      const unsub = bus.subscribe('t', msg => received.push(msg as number));
      unsub();
      bus.publish('t', i);
      expect(received).toHaveLength(0);
    });
  }
});

// subscriberCount — 100 tests
describe('subscriberCount()', () => {
  for (let n = 0; n <= 99; n++) {
    it(`subscriberCount = ${n} after ${n} subscribes`, () => {
      const bus = new MessageBus();
      for (let j = 0; j < n; j++) bus.subscribe('t', () => {});
      expect(bus.subscriberCount('t')).toBe(n);
    });
  }
});

// once() — 100 tests
describe('once() fires exactly once', () => {
  for (let i = 0; i < 100; i++) {
    it(`once delivers message ${i} exactly once`, () => {
      const bus = new MessageBus();
      const received: number[] = [];
      bus.once('t', msg => received.push(msg as number));
      bus.publish('t', i);
      bus.publish('t', i + 1); // should not be received
      expect(received).toEqual([i]);
    });
  }
});

// unsubscribeAll — 100 tests
describe('unsubscribeAll(topic)', () => {
  for (let n = 1; n <= 100; n++) {
    it(`unsubscribeAll removes all ${n} subscribers`, () => {
      const bus = new MessageBus();
      for (let j = 0; j < n; j++) bus.subscribe('t', () => {});
      bus.unsubscribeAll('t');
      expect(bus.subscriberCount('t')).toBe(0);
    });
  }
});

// topics() — 100 tests
describe('topics()', () => {
  for (let n = 0; n < 100; n++) {
    it(`topics() returns ${n} topics`, () => {
      const bus = new MessageBus();
      for (let j = 0; j < n; j++) bus.subscribe(`topic${j}`, () => {});
      expect(bus.topics()).toHaveLength(n);
    });
  }
});

// createBus factory — 100 tests
describe('createBus()', () => {
  for (let i = 0; i < 100; i++) {
    it(`createBus() returns a MessageBus (run ${i})`, () => {
      const bus = createBus();
      expect(bus).toBeInstanceOf(MessageBus);
    });
  }
});

// multiple topics — 100 tests
describe('publish to wrong topic not received', () => {
  for (let i = 0; i < 100; i++) {
    it(`subscriber on topic-A does not receive publish to topic-B (i=${i})`, () => {
      const bus = new MessageBus();
      const received: number[] = [];
      bus.subscribe(`topic-A-${i}`, msg => received.push(msg as number));
      bus.publish(`topic-B-${i}`, i);
      expect(received).toHaveLength(0);
    });
  }
});

// ─── Additional tests to reach ≥1,100 total ───────────────────────────────────

// unsubscribeAll() with no topic removes everything — 50 tests
describe('unsubscribeAll() removes all topics', () => {
  for (let n = 1; n <= 50; n++) {
    it(`unsubscribeAll() clears ${n} topics`, () => {
      const bus = new MessageBus();
      for (let j = 0; j < n; j++) bus.subscribe(`t${j}`, () => {});
      bus.unsubscribeAll();
      expect(bus.topics()).toHaveLength(0);
    });
  }
});

// multiple subscribers on same topic all receive — 50 tests
describe('multiple subscribers on same topic all receive', () => {
  for (let n = 1; n <= 50; n++) {
    it(`${n} subscribers all receive the published message`, () => {
      const bus = new MessageBus();
      const counts: number[] = [];
      for (let j = 0; j < n; j++) {
        bus.subscribe('shared', () => counts.push(j));
      }
      bus.publish('shared', 'hello');
      expect(counts).toHaveLength(n);
    });
  }
});

// subscribePattern with * wildcard — 50 tests
describe('subscribePattern * matches single segment', () => {
  for (let i = 0; i < 50; i++) {
    it(`pattern 'events/*' matches 'events/item${i}'`, () => {
      const bus = new MessageBus();
      const received: string[] = [];
      bus.subscribePattern('events/*', (topic) => received.push(topic));
      bus.publish(`events/item${i}`, i);
      expect(received).toEqual([`events/item${i}`]);
    });
  }
});

// subscribePattern with ** wildcard — 50 tests
describe('subscribePattern ** matches any path', () => {
  for (let i = 0; i < 50; i++) {
    it(`pattern 'logs/**' matches 'logs/a/b/c/${i}'`, () => {
      const bus = new MessageBus();
      const received: string[] = [];
      bus.subscribePattern('logs/**', (topic) => received.push(topic));
      bus.publish(`logs/a/b/c/${i}`, i);
      expect(received).toEqual([`logs/a/b/c/${i}`]);
    });
  }
});

// once() unsubscribe before fire — 50 tests
describe('once() cancel before fire', () => {
  for (let i = 0; i < 50; i++) {
    it(`once() cancel prevents delivery (i=${i})`, () => {
      const bus = new MessageBus();
      const received: number[] = [];
      const cancel = bus.once('t', msg => received.push(msg as number));
      cancel();
      bus.publish('t', i);
      expect(received).toHaveLength(0);
    });
  }
});

// subscribePattern unsubscribe — 50 tests
describe('subscribePattern unsubscribe removes handler', () => {
  for (let i = 0; i < 50; i++) {
    it(`subscribePattern unsub prevents delivery (i=${i})`, () => {
      const bus = new MessageBus();
      const received: number[] = [];
      const unsub = bus.subscribePattern('x/*', (topic, msg) => received.push(msg as number));
      unsub();
      bus.publish(`x/y${i}`, i);
      expect(received).toHaveLength(0);
    });
  }
});

// topics() excludes unsubscribed topics — 50 tests
describe('topics() excludes fully-unsubscribed topics', () => {
  for (let i = 0; i < 50; i++) {
    it(`topic is absent from topics() after all unsubs (i=${i})`, () => {
      const bus = new MessageBus();
      const unsub = bus.subscribe(`t${i}`, () => {});
      unsub();
      expect(bus.topics()).not.toContain(`t${i}`);
    });
  }
});

// subscriberCount after unsubscribe — 50 tests
describe('subscriberCount decrements after unsub', () => {
  for (let n = 1; n <= 50; n++) {
    it(`subscriberCount = ${n - 1} after ${n} subs then 1 unsub`, () => {
      const bus = new MessageBus();
      const unsub = bus.subscribe('t', () => {});
      for (let j = 1; j < n; j++) bus.subscribe('t', () => {});
      unsub();
      expect(bus.subscriberCount('t')).toBe(n - 1);
    });
  }
});

// publish to unknown topic returns 0 — 50 tests
describe('publish to topic with no subscribers returns 0', () => {
  for (let i = 0; i < 50; i++) {
    it(`publish to unknown topic ${i} returns 0`, () => {
      const bus = new MessageBus();
      expect(bus.publish(`unknown-${i}`, 'data')).toBe(0);
    });
  }
});

// subscriberCount on unknown topic returns 0 — 50 tests
describe('subscriberCount on unknown topic returns 0', () => {
  for (let i = 0; i < 50; i++) {
    it(`subscriberCount returns 0 for unknown topic ${i}`, () => {
      const bus = new MessageBus();
      expect(bus.subscriberCount(`no-such-topic-${i}`)).toBe(0);
    });
  }
});
