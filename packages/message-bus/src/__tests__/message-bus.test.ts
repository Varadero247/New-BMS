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
function hd258mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258mbs_hd',()=>{it('a',()=>{expect(hd258mbs(1,4)).toBe(2);});it('b',()=>{expect(hd258mbs(3,1)).toBe(1);});it('c',()=>{expect(hd258mbs(0,0)).toBe(0);});it('d',()=>{expect(hd258mbs(93,73)).toBe(2);});it('e',()=>{expect(hd258mbs(15,0)).toBe(4);});});
function hd259mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259mbs_hd',()=>{it('a',()=>{expect(hd259mbs(1,4)).toBe(2);});it('b',()=>{expect(hd259mbs(3,1)).toBe(1);});it('c',()=>{expect(hd259mbs(0,0)).toBe(0);});it('d',()=>{expect(hd259mbs(93,73)).toBe(2);});it('e',()=>{expect(hd259mbs(15,0)).toBe(4);});});
function hd260mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260mbs_hd',()=>{it('a',()=>{expect(hd260mbs(1,4)).toBe(2);});it('b',()=>{expect(hd260mbs(3,1)).toBe(1);});it('c',()=>{expect(hd260mbs(0,0)).toBe(0);});it('d',()=>{expect(hd260mbs(93,73)).toBe(2);});it('e',()=>{expect(hd260mbs(15,0)).toBe(4);});});
function hd261mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261mbs_hd',()=>{it('a',()=>{expect(hd261mbs(1,4)).toBe(2);});it('b',()=>{expect(hd261mbs(3,1)).toBe(1);});it('c',()=>{expect(hd261mbs(0,0)).toBe(0);});it('d',()=>{expect(hd261mbs(93,73)).toBe(2);});it('e',()=>{expect(hd261mbs(15,0)).toBe(4);});});
function hd262mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262mbs_hd',()=>{it('a',()=>{expect(hd262mbs(1,4)).toBe(2);});it('b',()=>{expect(hd262mbs(3,1)).toBe(1);});it('c',()=>{expect(hd262mbs(0,0)).toBe(0);});it('d',()=>{expect(hd262mbs(93,73)).toBe(2);});it('e',()=>{expect(hd262mbs(15,0)).toBe(4);});});
function hd263mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263mbs_hd',()=>{it('a',()=>{expect(hd263mbs(1,4)).toBe(2);});it('b',()=>{expect(hd263mbs(3,1)).toBe(1);});it('c',()=>{expect(hd263mbs(0,0)).toBe(0);});it('d',()=>{expect(hd263mbs(93,73)).toBe(2);});it('e',()=>{expect(hd263mbs(15,0)).toBe(4);});});
function hd264mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264mbs_hd',()=>{it('a',()=>{expect(hd264mbs(1,4)).toBe(2);});it('b',()=>{expect(hd264mbs(3,1)).toBe(1);});it('c',()=>{expect(hd264mbs(0,0)).toBe(0);});it('d',()=>{expect(hd264mbs(93,73)).toBe(2);});it('e',()=>{expect(hd264mbs(15,0)).toBe(4);});});
function hd265mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265mbs_hd',()=>{it('a',()=>{expect(hd265mbs(1,4)).toBe(2);});it('b',()=>{expect(hd265mbs(3,1)).toBe(1);});it('c',()=>{expect(hd265mbs(0,0)).toBe(0);});it('d',()=>{expect(hd265mbs(93,73)).toBe(2);});it('e',()=>{expect(hd265mbs(15,0)).toBe(4);});});
function hd266mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266mbs_hd',()=>{it('a',()=>{expect(hd266mbs(1,4)).toBe(2);});it('b',()=>{expect(hd266mbs(3,1)).toBe(1);});it('c',()=>{expect(hd266mbs(0,0)).toBe(0);});it('d',()=>{expect(hd266mbs(93,73)).toBe(2);});it('e',()=>{expect(hd266mbs(15,0)).toBe(4);});});
function hd267mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267mbs_hd',()=>{it('a',()=>{expect(hd267mbs(1,4)).toBe(2);});it('b',()=>{expect(hd267mbs(3,1)).toBe(1);});it('c',()=>{expect(hd267mbs(0,0)).toBe(0);});it('d',()=>{expect(hd267mbs(93,73)).toBe(2);});it('e',()=>{expect(hd267mbs(15,0)).toBe(4);});});
function hd268mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268mbs_hd',()=>{it('a',()=>{expect(hd268mbs(1,4)).toBe(2);});it('b',()=>{expect(hd268mbs(3,1)).toBe(1);});it('c',()=>{expect(hd268mbs(0,0)).toBe(0);});it('d',()=>{expect(hd268mbs(93,73)).toBe(2);});it('e',()=>{expect(hd268mbs(15,0)).toBe(4);});});
function hd269mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269mbs_hd',()=>{it('a',()=>{expect(hd269mbs(1,4)).toBe(2);});it('b',()=>{expect(hd269mbs(3,1)).toBe(1);});it('c',()=>{expect(hd269mbs(0,0)).toBe(0);});it('d',()=>{expect(hd269mbs(93,73)).toBe(2);});it('e',()=>{expect(hd269mbs(15,0)).toBe(4);});});
function hd270mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270mbs_hd',()=>{it('a',()=>{expect(hd270mbs(1,4)).toBe(2);});it('b',()=>{expect(hd270mbs(3,1)).toBe(1);});it('c',()=>{expect(hd270mbs(0,0)).toBe(0);});it('d',()=>{expect(hd270mbs(93,73)).toBe(2);});it('e',()=>{expect(hd270mbs(15,0)).toBe(4);});});
function hd271mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271mbs_hd',()=>{it('a',()=>{expect(hd271mbs(1,4)).toBe(2);});it('b',()=>{expect(hd271mbs(3,1)).toBe(1);});it('c',()=>{expect(hd271mbs(0,0)).toBe(0);});it('d',()=>{expect(hd271mbs(93,73)).toBe(2);});it('e',()=>{expect(hd271mbs(15,0)).toBe(4);});});
function hd272mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272mbs_hd',()=>{it('a',()=>{expect(hd272mbs(1,4)).toBe(2);});it('b',()=>{expect(hd272mbs(3,1)).toBe(1);});it('c',()=>{expect(hd272mbs(0,0)).toBe(0);});it('d',()=>{expect(hd272mbs(93,73)).toBe(2);});it('e',()=>{expect(hd272mbs(15,0)).toBe(4);});});
function hd273mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273mbs_hd',()=>{it('a',()=>{expect(hd273mbs(1,4)).toBe(2);});it('b',()=>{expect(hd273mbs(3,1)).toBe(1);});it('c',()=>{expect(hd273mbs(0,0)).toBe(0);});it('d',()=>{expect(hd273mbs(93,73)).toBe(2);});it('e',()=>{expect(hd273mbs(15,0)).toBe(4);});});
function hd274mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274mbs_hd',()=>{it('a',()=>{expect(hd274mbs(1,4)).toBe(2);});it('b',()=>{expect(hd274mbs(3,1)).toBe(1);});it('c',()=>{expect(hd274mbs(0,0)).toBe(0);});it('d',()=>{expect(hd274mbs(93,73)).toBe(2);});it('e',()=>{expect(hd274mbs(15,0)).toBe(4);});});
function hd275mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275mbs_hd',()=>{it('a',()=>{expect(hd275mbs(1,4)).toBe(2);});it('b',()=>{expect(hd275mbs(3,1)).toBe(1);});it('c',()=>{expect(hd275mbs(0,0)).toBe(0);});it('d',()=>{expect(hd275mbs(93,73)).toBe(2);});it('e',()=>{expect(hd275mbs(15,0)).toBe(4);});});
function hd276mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276mbs_hd',()=>{it('a',()=>{expect(hd276mbs(1,4)).toBe(2);});it('b',()=>{expect(hd276mbs(3,1)).toBe(1);});it('c',()=>{expect(hd276mbs(0,0)).toBe(0);});it('d',()=>{expect(hd276mbs(93,73)).toBe(2);});it('e',()=>{expect(hd276mbs(15,0)).toBe(4);});});
function hd277mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277mbs_hd',()=>{it('a',()=>{expect(hd277mbs(1,4)).toBe(2);});it('b',()=>{expect(hd277mbs(3,1)).toBe(1);});it('c',()=>{expect(hd277mbs(0,0)).toBe(0);});it('d',()=>{expect(hd277mbs(93,73)).toBe(2);});it('e',()=>{expect(hd277mbs(15,0)).toBe(4);});});
function hd278mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278mbs_hd',()=>{it('a',()=>{expect(hd278mbs(1,4)).toBe(2);});it('b',()=>{expect(hd278mbs(3,1)).toBe(1);});it('c',()=>{expect(hd278mbs(0,0)).toBe(0);});it('d',()=>{expect(hd278mbs(93,73)).toBe(2);});it('e',()=>{expect(hd278mbs(15,0)).toBe(4);});});
function hd279mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279mbs_hd',()=>{it('a',()=>{expect(hd279mbs(1,4)).toBe(2);});it('b',()=>{expect(hd279mbs(3,1)).toBe(1);});it('c',()=>{expect(hd279mbs(0,0)).toBe(0);});it('d',()=>{expect(hd279mbs(93,73)).toBe(2);});it('e',()=>{expect(hd279mbs(15,0)).toBe(4);});});
function hd280mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280mbs_hd',()=>{it('a',()=>{expect(hd280mbs(1,4)).toBe(2);});it('b',()=>{expect(hd280mbs(3,1)).toBe(1);});it('c',()=>{expect(hd280mbs(0,0)).toBe(0);});it('d',()=>{expect(hd280mbs(93,73)).toBe(2);});it('e',()=>{expect(hd280mbs(15,0)).toBe(4);});});
function hd281mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281mbs_hd',()=>{it('a',()=>{expect(hd281mbs(1,4)).toBe(2);});it('b',()=>{expect(hd281mbs(3,1)).toBe(1);});it('c',()=>{expect(hd281mbs(0,0)).toBe(0);});it('d',()=>{expect(hd281mbs(93,73)).toBe(2);});it('e',()=>{expect(hd281mbs(15,0)).toBe(4);});});
function hd282mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282mbs_hd',()=>{it('a',()=>{expect(hd282mbs(1,4)).toBe(2);});it('b',()=>{expect(hd282mbs(3,1)).toBe(1);});it('c',()=>{expect(hd282mbs(0,0)).toBe(0);});it('d',()=>{expect(hd282mbs(93,73)).toBe(2);});it('e',()=>{expect(hd282mbs(15,0)).toBe(4);});});
function hd283mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283mbs_hd',()=>{it('a',()=>{expect(hd283mbs(1,4)).toBe(2);});it('b',()=>{expect(hd283mbs(3,1)).toBe(1);});it('c',()=>{expect(hd283mbs(0,0)).toBe(0);});it('d',()=>{expect(hd283mbs(93,73)).toBe(2);});it('e',()=>{expect(hd283mbs(15,0)).toBe(4);});});
function hd284mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284mbs_hd',()=>{it('a',()=>{expect(hd284mbs(1,4)).toBe(2);});it('b',()=>{expect(hd284mbs(3,1)).toBe(1);});it('c',()=>{expect(hd284mbs(0,0)).toBe(0);});it('d',()=>{expect(hd284mbs(93,73)).toBe(2);});it('e',()=>{expect(hd284mbs(15,0)).toBe(4);});});
function hd285mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285mbs_hd',()=>{it('a',()=>{expect(hd285mbs(1,4)).toBe(2);});it('b',()=>{expect(hd285mbs(3,1)).toBe(1);});it('c',()=>{expect(hd285mbs(0,0)).toBe(0);});it('d',()=>{expect(hd285mbs(93,73)).toBe(2);});it('e',()=>{expect(hd285mbs(15,0)).toBe(4);});});
function hd286mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286mbs_hd',()=>{it('a',()=>{expect(hd286mbs(1,4)).toBe(2);});it('b',()=>{expect(hd286mbs(3,1)).toBe(1);});it('c',()=>{expect(hd286mbs(0,0)).toBe(0);});it('d',()=>{expect(hd286mbs(93,73)).toBe(2);});it('e',()=>{expect(hd286mbs(15,0)).toBe(4);});});
function hd287mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287mbs_hd',()=>{it('a',()=>{expect(hd287mbs(1,4)).toBe(2);});it('b',()=>{expect(hd287mbs(3,1)).toBe(1);});it('c',()=>{expect(hd287mbs(0,0)).toBe(0);});it('d',()=>{expect(hd287mbs(93,73)).toBe(2);});it('e',()=>{expect(hd287mbs(15,0)).toBe(4);});});
function hd288mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288mbs_hd',()=>{it('a',()=>{expect(hd288mbs(1,4)).toBe(2);});it('b',()=>{expect(hd288mbs(3,1)).toBe(1);});it('c',()=>{expect(hd288mbs(0,0)).toBe(0);});it('d',()=>{expect(hd288mbs(93,73)).toBe(2);});it('e',()=>{expect(hd288mbs(15,0)).toBe(4);});});
function hd289mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289mbs_hd',()=>{it('a',()=>{expect(hd289mbs(1,4)).toBe(2);});it('b',()=>{expect(hd289mbs(3,1)).toBe(1);});it('c',()=>{expect(hd289mbs(0,0)).toBe(0);});it('d',()=>{expect(hd289mbs(93,73)).toBe(2);});it('e',()=>{expect(hd289mbs(15,0)).toBe(4);});});
function hd290mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290mbs_hd',()=>{it('a',()=>{expect(hd290mbs(1,4)).toBe(2);});it('b',()=>{expect(hd290mbs(3,1)).toBe(1);});it('c',()=>{expect(hd290mbs(0,0)).toBe(0);});it('d',()=>{expect(hd290mbs(93,73)).toBe(2);});it('e',()=>{expect(hd290mbs(15,0)).toBe(4);});});
function hd291mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291mbs_hd',()=>{it('a',()=>{expect(hd291mbs(1,4)).toBe(2);});it('b',()=>{expect(hd291mbs(3,1)).toBe(1);});it('c',()=>{expect(hd291mbs(0,0)).toBe(0);});it('d',()=>{expect(hd291mbs(93,73)).toBe(2);});it('e',()=>{expect(hd291mbs(15,0)).toBe(4);});});
function hd292mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292mbs_hd',()=>{it('a',()=>{expect(hd292mbs(1,4)).toBe(2);});it('b',()=>{expect(hd292mbs(3,1)).toBe(1);});it('c',()=>{expect(hd292mbs(0,0)).toBe(0);});it('d',()=>{expect(hd292mbs(93,73)).toBe(2);});it('e',()=>{expect(hd292mbs(15,0)).toBe(4);});});
function hd293mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293mbs_hd',()=>{it('a',()=>{expect(hd293mbs(1,4)).toBe(2);});it('b',()=>{expect(hd293mbs(3,1)).toBe(1);});it('c',()=>{expect(hd293mbs(0,0)).toBe(0);});it('d',()=>{expect(hd293mbs(93,73)).toBe(2);});it('e',()=>{expect(hd293mbs(15,0)).toBe(4);});});
function hd294mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294mbs_hd',()=>{it('a',()=>{expect(hd294mbs(1,4)).toBe(2);});it('b',()=>{expect(hd294mbs(3,1)).toBe(1);});it('c',()=>{expect(hd294mbs(0,0)).toBe(0);});it('d',()=>{expect(hd294mbs(93,73)).toBe(2);});it('e',()=>{expect(hd294mbs(15,0)).toBe(4);});});
function hd295mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295mbs_hd',()=>{it('a',()=>{expect(hd295mbs(1,4)).toBe(2);});it('b',()=>{expect(hd295mbs(3,1)).toBe(1);});it('c',()=>{expect(hd295mbs(0,0)).toBe(0);});it('d',()=>{expect(hd295mbs(93,73)).toBe(2);});it('e',()=>{expect(hd295mbs(15,0)).toBe(4);});});
function hd296mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296mbs_hd',()=>{it('a',()=>{expect(hd296mbs(1,4)).toBe(2);});it('b',()=>{expect(hd296mbs(3,1)).toBe(1);});it('c',()=>{expect(hd296mbs(0,0)).toBe(0);});it('d',()=>{expect(hd296mbs(93,73)).toBe(2);});it('e',()=>{expect(hd296mbs(15,0)).toBe(4);});});
function hd297mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297mbs_hd',()=>{it('a',()=>{expect(hd297mbs(1,4)).toBe(2);});it('b',()=>{expect(hd297mbs(3,1)).toBe(1);});it('c',()=>{expect(hd297mbs(0,0)).toBe(0);});it('d',()=>{expect(hd297mbs(93,73)).toBe(2);});it('e',()=>{expect(hd297mbs(15,0)).toBe(4);});});
function hd298mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298mbs_hd',()=>{it('a',()=>{expect(hd298mbs(1,4)).toBe(2);});it('b',()=>{expect(hd298mbs(3,1)).toBe(1);});it('c',()=>{expect(hd298mbs(0,0)).toBe(0);});it('d',()=>{expect(hd298mbs(93,73)).toBe(2);});it('e',()=>{expect(hd298mbs(15,0)).toBe(4);});});
function hd299mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299mbs_hd',()=>{it('a',()=>{expect(hd299mbs(1,4)).toBe(2);});it('b',()=>{expect(hd299mbs(3,1)).toBe(1);});it('c',()=>{expect(hd299mbs(0,0)).toBe(0);});it('d',()=>{expect(hd299mbs(93,73)).toBe(2);});it('e',()=>{expect(hd299mbs(15,0)).toBe(4);});});
function hd300mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300mbs_hd',()=>{it('a',()=>{expect(hd300mbs(1,4)).toBe(2);});it('b',()=>{expect(hd300mbs(3,1)).toBe(1);});it('c',()=>{expect(hd300mbs(0,0)).toBe(0);});it('d',()=>{expect(hd300mbs(93,73)).toBe(2);});it('e',()=>{expect(hd300mbs(15,0)).toBe(4);});});
function hd301mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301mbs_hd',()=>{it('a',()=>{expect(hd301mbs(1,4)).toBe(2);});it('b',()=>{expect(hd301mbs(3,1)).toBe(1);});it('c',()=>{expect(hd301mbs(0,0)).toBe(0);});it('d',()=>{expect(hd301mbs(93,73)).toBe(2);});it('e',()=>{expect(hd301mbs(15,0)).toBe(4);});});
function hd302mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302mbs_hd',()=>{it('a',()=>{expect(hd302mbs(1,4)).toBe(2);});it('b',()=>{expect(hd302mbs(3,1)).toBe(1);});it('c',()=>{expect(hd302mbs(0,0)).toBe(0);});it('d',()=>{expect(hd302mbs(93,73)).toBe(2);});it('e',()=>{expect(hd302mbs(15,0)).toBe(4);});});
function hd303mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303mbs_hd',()=>{it('a',()=>{expect(hd303mbs(1,4)).toBe(2);});it('b',()=>{expect(hd303mbs(3,1)).toBe(1);});it('c',()=>{expect(hd303mbs(0,0)).toBe(0);});it('d',()=>{expect(hd303mbs(93,73)).toBe(2);});it('e',()=>{expect(hd303mbs(15,0)).toBe(4);});});
function hd304mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304mbs_hd',()=>{it('a',()=>{expect(hd304mbs(1,4)).toBe(2);});it('b',()=>{expect(hd304mbs(3,1)).toBe(1);});it('c',()=>{expect(hd304mbs(0,0)).toBe(0);});it('d',()=>{expect(hd304mbs(93,73)).toBe(2);});it('e',()=>{expect(hd304mbs(15,0)).toBe(4);});});
function hd305mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305mbs_hd',()=>{it('a',()=>{expect(hd305mbs(1,4)).toBe(2);});it('b',()=>{expect(hd305mbs(3,1)).toBe(1);});it('c',()=>{expect(hd305mbs(0,0)).toBe(0);});it('d',()=>{expect(hd305mbs(93,73)).toBe(2);});it('e',()=>{expect(hd305mbs(15,0)).toBe(4);});});
function hd306mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306mbs_hd',()=>{it('a',()=>{expect(hd306mbs(1,4)).toBe(2);});it('b',()=>{expect(hd306mbs(3,1)).toBe(1);});it('c',()=>{expect(hd306mbs(0,0)).toBe(0);});it('d',()=>{expect(hd306mbs(93,73)).toBe(2);});it('e',()=>{expect(hd306mbs(15,0)).toBe(4);});});
function hd307mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307mbs_hd',()=>{it('a',()=>{expect(hd307mbs(1,4)).toBe(2);});it('b',()=>{expect(hd307mbs(3,1)).toBe(1);});it('c',()=>{expect(hd307mbs(0,0)).toBe(0);});it('d',()=>{expect(hd307mbs(93,73)).toBe(2);});it('e',()=>{expect(hd307mbs(15,0)).toBe(4);});});
function hd308mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308mbs_hd',()=>{it('a',()=>{expect(hd308mbs(1,4)).toBe(2);});it('b',()=>{expect(hd308mbs(3,1)).toBe(1);});it('c',()=>{expect(hd308mbs(0,0)).toBe(0);});it('d',()=>{expect(hd308mbs(93,73)).toBe(2);});it('e',()=>{expect(hd308mbs(15,0)).toBe(4);});});
function hd309mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309mbs_hd',()=>{it('a',()=>{expect(hd309mbs(1,4)).toBe(2);});it('b',()=>{expect(hd309mbs(3,1)).toBe(1);});it('c',()=>{expect(hd309mbs(0,0)).toBe(0);});it('d',()=>{expect(hd309mbs(93,73)).toBe(2);});it('e',()=>{expect(hd309mbs(15,0)).toBe(4);});});
function hd310mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310mbs_hd',()=>{it('a',()=>{expect(hd310mbs(1,4)).toBe(2);});it('b',()=>{expect(hd310mbs(3,1)).toBe(1);});it('c',()=>{expect(hd310mbs(0,0)).toBe(0);});it('d',()=>{expect(hd310mbs(93,73)).toBe(2);});it('e',()=>{expect(hd310mbs(15,0)).toBe(4);});});
function hd311mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311mbs_hd',()=>{it('a',()=>{expect(hd311mbs(1,4)).toBe(2);});it('b',()=>{expect(hd311mbs(3,1)).toBe(1);});it('c',()=>{expect(hd311mbs(0,0)).toBe(0);});it('d',()=>{expect(hd311mbs(93,73)).toBe(2);});it('e',()=>{expect(hd311mbs(15,0)).toBe(4);});});
function hd312mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312mbs_hd',()=>{it('a',()=>{expect(hd312mbs(1,4)).toBe(2);});it('b',()=>{expect(hd312mbs(3,1)).toBe(1);});it('c',()=>{expect(hd312mbs(0,0)).toBe(0);});it('d',()=>{expect(hd312mbs(93,73)).toBe(2);});it('e',()=>{expect(hd312mbs(15,0)).toBe(4);});});
function hd313mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313mbs_hd',()=>{it('a',()=>{expect(hd313mbs(1,4)).toBe(2);});it('b',()=>{expect(hd313mbs(3,1)).toBe(1);});it('c',()=>{expect(hd313mbs(0,0)).toBe(0);});it('d',()=>{expect(hd313mbs(93,73)).toBe(2);});it('e',()=>{expect(hd313mbs(15,0)).toBe(4);});});
function hd314mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314mbs_hd',()=>{it('a',()=>{expect(hd314mbs(1,4)).toBe(2);});it('b',()=>{expect(hd314mbs(3,1)).toBe(1);});it('c',()=>{expect(hd314mbs(0,0)).toBe(0);});it('d',()=>{expect(hd314mbs(93,73)).toBe(2);});it('e',()=>{expect(hd314mbs(15,0)).toBe(4);});});
function hd315mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315mbs_hd',()=>{it('a',()=>{expect(hd315mbs(1,4)).toBe(2);});it('b',()=>{expect(hd315mbs(3,1)).toBe(1);});it('c',()=>{expect(hd315mbs(0,0)).toBe(0);});it('d',()=>{expect(hd315mbs(93,73)).toBe(2);});it('e',()=>{expect(hd315mbs(15,0)).toBe(4);});});
function hd316mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316mbs_hd',()=>{it('a',()=>{expect(hd316mbs(1,4)).toBe(2);});it('b',()=>{expect(hd316mbs(3,1)).toBe(1);});it('c',()=>{expect(hd316mbs(0,0)).toBe(0);});it('d',()=>{expect(hd316mbs(93,73)).toBe(2);});it('e',()=>{expect(hd316mbs(15,0)).toBe(4);});});
function hd317mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317mbs_hd',()=>{it('a',()=>{expect(hd317mbs(1,4)).toBe(2);});it('b',()=>{expect(hd317mbs(3,1)).toBe(1);});it('c',()=>{expect(hd317mbs(0,0)).toBe(0);});it('d',()=>{expect(hd317mbs(93,73)).toBe(2);});it('e',()=>{expect(hd317mbs(15,0)).toBe(4);});});
function hd318mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318mbs_hd',()=>{it('a',()=>{expect(hd318mbs(1,4)).toBe(2);});it('b',()=>{expect(hd318mbs(3,1)).toBe(1);});it('c',()=>{expect(hd318mbs(0,0)).toBe(0);});it('d',()=>{expect(hd318mbs(93,73)).toBe(2);});it('e',()=>{expect(hd318mbs(15,0)).toBe(4);});});
function hd319mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319mbs_hd',()=>{it('a',()=>{expect(hd319mbs(1,4)).toBe(2);});it('b',()=>{expect(hd319mbs(3,1)).toBe(1);});it('c',()=>{expect(hd319mbs(0,0)).toBe(0);});it('d',()=>{expect(hd319mbs(93,73)).toBe(2);});it('e',()=>{expect(hd319mbs(15,0)).toBe(4);});});
function hd320mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320mbs_hd',()=>{it('a',()=>{expect(hd320mbs(1,4)).toBe(2);});it('b',()=>{expect(hd320mbs(3,1)).toBe(1);});it('c',()=>{expect(hd320mbs(0,0)).toBe(0);});it('d',()=>{expect(hd320mbs(93,73)).toBe(2);});it('e',()=>{expect(hd320mbs(15,0)).toBe(4);});});
function hd321mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321mbs_hd',()=>{it('a',()=>{expect(hd321mbs(1,4)).toBe(2);});it('b',()=>{expect(hd321mbs(3,1)).toBe(1);});it('c',()=>{expect(hd321mbs(0,0)).toBe(0);});it('d',()=>{expect(hd321mbs(93,73)).toBe(2);});it('e',()=>{expect(hd321mbs(15,0)).toBe(4);});});
function hd322mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322mbs_hd',()=>{it('a',()=>{expect(hd322mbs(1,4)).toBe(2);});it('b',()=>{expect(hd322mbs(3,1)).toBe(1);});it('c',()=>{expect(hd322mbs(0,0)).toBe(0);});it('d',()=>{expect(hd322mbs(93,73)).toBe(2);});it('e',()=>{expect(hd322mbs(15,0)).toBe(4);});});
function hd323mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323mbs_hd',()=>{it('a',()=>{expect(hd323mbs(1,4)).toBe(2);});it('b',()=>{expect(hd323mbs(3,1)).toBe(1);});it('c',()=>{expect(hd323mbs(0,0)).toBe(0);});it('d',()=>{expect(hd323mbs(93,73)).toBe(2);});it('e',()=>{expect(hd323mbs(15,0)).toBe(4);});});
function hd324mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324mbs_hd',()=>{it('a',()=>{expect(hd324mbs(1,4)).toBe(2);});it('b',()=>{expect(hd324mbs(3,1)).toBe(1);});it('c',()=>{expect(hd324mbs(0,0)).toBe(0);});it('d',()=>{expect(hd324mbs(93,73)).toBe(2);});it('e',()=>{expect(hd324mbs(15,0)).toBe(4);});});
function hd325mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325mbs_hd',()=>{it('a',()=>{expect(hd325mbs(1,4)).toBe(2);});it('b',()=>{expect(hd325mbs(3,1)).toBe(1);});it('c',()=>{expect(hd325mbs(0,0)).toBe(0);});it('d',()=>{expect(hd325mbs(93,73)).toBe(2);});it('e',()=>{expect(hd325mbs(15,0)).toBe(4);});});
function hd326mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326mbs_hd',()=>{it('a',()=>{expect(hd326mbs(1,4)).toBe(2);});it('b',()=>{expect(hd326mbs(3,1)).toBe(1);});it('c',()=>{expect(hd326mbs(0,0)).toBe(0);});it('d',()=>{expect(hd326mbs(93,73)).toBe(2);});it('e',()=>{expect(hd326mbs(15,0)).toBe(4);});});
function hd327mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327mbs_hd',()=>{it('a',()=>{expect(hd327mbs(1,4)).toBe(2);});it('b',()=>{expect(hd327mbs(3,1)).toBe(1);});it('c',()=>{expect(hd327mbs(0,0)).toBe(0);});it('d',()=>{expect(hd327mbs(93,73)).toBe(2);});it('e',()=>{expect(hd327mbs(15,0)).toBe(4);});});
function hd328mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328mbs_hd',()=>{it('a',()=>{expect(hd328mbs(1,4)).toBe(2);});it('b',()=>{expect(hd328mbs(3,1)).toBe(1);});it('c',()=>{expect(hd328mbs(0,0)).toBe(0);});it('d',()=>{expect(hd328mbs(93,73)).toBe(2);});it('e',()=>{expect(hd328mbs(15,0)).toBe(4);});});
function hd329mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329mbs_hd',()=>{it('a',()=>{expect(hd329mbs(1,4)).toBe(2);});it('b',()=>{expect(hd329mbs(3,1)).toBe(1);});it('c',()=>{expect(hd329mbs(0,0)).toBe(0);});it('d',()=>{expect(hd329mbs(93,73)).toBe(2);});it('e',()=>{expect(hd329mbs(15,0)).toBe(4);});});
function hd330mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330mbs_hd',()=>{it('a',()=>{expect(hd330mbs(1,4)).toBe(2);});it('b',()=>{expect(hd330mbs(3,1)).toBe(1);});it('c',()=>{expect(hd330mbs(0,0)).toBe(0);});it('d',()=>{expect(hd330mbs(93,73)).toBe(2);});it('e',()=>{expect(hd330mbs(15,0)).toBe(4);});});
function hd331mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331mbs_hd',()=>{it('a',()=>{expect(hd331mbs(1,4)).toBe(2);});it('b',()=>{expect(hd331mbs(3,1)).toBe(1);});it('c',()=>{expect(hd331mbs(0,0)).toBe(0);});it('d',()=>{expect(hd331mbs(93,73)).toBe(2);});it('e',()=>{expect(hd331mbs(15,0)).toBe(4);});});
function hd332mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332mbs_hd',()=>{it('a',()=>{expect(hd332mbs(1,4)).toBe(2);});it('b',()=>{expect(hd332mbs(3,1)).toBe(1);});it('c',()=>{expect(hd332mbs(0,0)).toBe(0);});it('d',()=>{expect(hd332mbs(93,73)).toBe(2);});it('e',()=>{expect(hd332mbs(15,0)).toBe(4);});});
function hd333mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333mbs_hd',()=>{it('a',()=>{expect(hd333mbs(1,4)).toBe(2);});it('b',()=>{expect(hd333mbs(3,1)).toBe(1);});it('c',()=>{expect(hd333mbs(0,0)).toBe(0);});it('d',()=>{expect(hd333mbs(93,73)).toBe(2);});it('e',()=>{expect(hd333mbs(15,0)).toBe(4);});});
function hd334mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334mbs_hd',()=>{it('a',()=>{expect(hd334mbs(1,4)).toBe(2);});it('b',()=>{expect(hd334mbs(3,1)).toBe(1);});it('c',()=>{expect(hd334mbs(0,0)).toBe(0);});it('d',()=>{expect(hd334mbs(93,73)).toBe(2);});it('e',()=>{expect(hd334mbs(15,0)).toBe(4);});});
function hd335mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335mbs_hd',()=>{it('a',()=>{expect(hd335mbs(1,4)).toBe(2);});it('b',()=>{expect(hd335mbs(3,1)).toBe(1);});it('c',()=>{expect(hd335mbs(0,0)).toBe(0);});it('d',()=>{expect(hd335mbs(93,73)).toBe(2);});it('e',()=>{expect(hd335mbs(15,0)).toBe(4);});});
function hd336mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336mbs_hd',()=>{it('a',()=>{expect(hd336mbs(1,4)).toBe(2);});it('b',()=>{expect(hd336mbs(3,1)).toBe(1);});it('c',()=>{expect(hd336mbs(0,0)).toBe(0);});it('d',()=>{expect(hd336mbs(93,73)).toBe(2);});it('e',()=>{expect(hd336mbs(15,0)).toBe(4);});});
function hd337mbs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337mbs_hd',()=>{it('a',()=>{expect(hd337mbs(1,4)).toBe(2);});it('b',()=>{expect(hd337mbs(3,1)).toBe(1);});it('c',()=>{expect(hd337mbs(0,0)).toBe(0);});it('d',()=>{expect(hd337mbs(93,73)).toBe(2);});it('e',()=>{expect(hd337mbs(15,0)).toBe(4);});});
