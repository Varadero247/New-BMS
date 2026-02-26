// Copyright (c) 2026 Nexara DMCC. All rights reserved.

import {
  createEventLog,
  createReplay,
  deduplicate,
  aggregate,
  groupByType,
  groupByTimeBucket,
  filterByTypes,
  filterByTimeRange,
  serializeLog,
  deserializeLog,
  RecordedEvent,
} from '../event-replay';

// ─── Section 1: createEventLog append/getAll/count (200 tests) ───
describe('createEventLog - append / getAll / count', () => {
  it('creates an empty log', () => {
    const log = createEventLog();
    expect(log.count()).toBe(0);
  });
  it('returns empty array from getAll on new log', () => {
    const log = createEventLog();
    expect(log.getAll()).toEqual([]);
  });
  it('append returns a RecordedEvent with id and timestamp', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'click', payload: null });
    expect(ev.id).toBeDefined();
    expect(ev.timestamp).toBeGreaterThan(0);
    expect(ev.type).toBe('click');
  });
  it('append sets type correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'login', payload: {} });
    expect(ev.type).toBe('login');
  });
  it('append sets payload correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'x', payload: 42 });
    expect(ev.payload).toBe(42);
  });
  it('append returns event with string id', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'x', payload: null });
    expect(typeof ev.id).toBe('string');
  });
  it('append increments count by 1', () => {
    const log = createEventLog();
    log.append({ type: 'a', payload: null });
    expect(log.count()).toBe(1);
  });
  it('multiple appends increment count', () => {
    const log = createEventLog();
    for (let i = 0; i < 5; i++) log.append({ type: 'a', payload: i });
    expect(log.count()).toBe(5);
  });
  it('getAll returns shallow copy', () => {
    const log = createEventLog();
    log.append({ type: 'a', payload: null });
    const all1 = log.getAll();
    const all2 = log.getAll();
    expect(all1).not.toBe(all2);
  });
  it('getAll copy does not affect internal state when mutated', () => {
    const log = createEventLog();
    log.append({ type: 'a', payload: null });
    const all = log.getAll();
    all.pop();
    expect(log.count()).toBe(1);
  });
  it('clear resets count to 0', () => {
    const log = createEventLog();
    log.append({ type: 'a', payload: null });
    log.clear();
    expect(log.count()).toBe(0);
  });
  it('clear makes getAll return empty array', () => {
    const log = createEventLog();
    log.append({ type: 'a', payload: null });
    log.clear();
    expect(log.getAll()).toEqual([]);
  });
  it('can append after clear', () => {
    const log = createEventLog();
    log.append({ type: 'a', payload: null });
    log.clear();
    log.append({ type: 'b', payload: 1 });
    expect(log.count()).toBe(1);
  });
  it('append preserves metadata field', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'x', payload: null, metadata: { src: 'test' } });
    expect(ev.metadata).toEqual({ src: 'test' });
  });
  it('append without metadata leaves metadata undefined', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'x', payload: null });
    expect(ev.metadata).toBeUndefined();
  });
  it('events in getAll match append order', () => {
    const log = createEventLog();
    log.append({ type: 'first', payload: 1 });
    log.append({ type: 'second', payload: 2 });
    const all = log.getAll();
    expect(all[0].type).toBe('first');
    expect(all[1].type).toBe('second');
  });
  it('each appended event has a unique id', () => {
    const log = createEventLog();
    const ids = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const ev = log.append({ type: 'x', payload: i });
      ids.add(ev.id);
    }
    expect(ids.size).toBe(10);
  });
  it('count matches getAll length', () => {
    const log = createEventLog();
    for (let i = 0; i < 7; i++) log.append({ type: 'x', payload: i });
    expect(log.count()).toBe(log.getAll().length);
  });
  it('payload can be an object', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'x', payload: { a: 1 } });
    expect(ev.payload).toEqual({ a: 1 });
  });
  it('payload can be an array', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'x', payload: [1, 2, 3] });
    expect(ev.payload).toEqual([1, 2, 3]);
  });
  it('payload can be a string', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'x', payload: 'hello' });
    expect(ev.payload).toBe('hello');
  });
  it('payload can be boolean true', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'x', payload: true });
    expect(ev.payload).toBe(true);
  });
  it('payload can be boolean false', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'x', payload: false });
    expect(ev.payload).toBe(false);
  });
  it('append test #1: appends event with type t1 and payload 1', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't1', payload: 1 });
    expect(ev.type).toBe('t1');
    expect(ev.payload).toBe(1);
    expect(log.count()).toBe(1);
  });
  it('append test #2: appends event with type t2 and payload 2', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't2', payload: 2 });
    expect(ev.type).toBe('t2');
    expect(ev.payload).toBe(2);
    expect(log.count()).toBe(1);
  });
  it('append test #3: appends event with type t3 and payload 3', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't3', payload: 3 });
    expect(ev.type).toBe('t3');
    expect(ev.payload).toBe(3);
    expect(log.count()).toBe(1);
  });
  it('append test #4: appends event with type t4 and payload 4', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't4', payload: 4 });
    expect(ev.type).toBe('t4');
    expect(ev.payload).toBe(4);
    expect(log.count()).toBe(1);
  });
  it('append test #5: appends event with type t5 and payload 5', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't5', payload: 5 });
    expect(ev.type).toBe('t5');
    expect(ev.payload).toBe(5);
    expect(log.count()).toBe(1);
  });
  it('append test #6: appends event with type t6 and payload 6', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't6', payload: 6 });
    expect(ev.type).toBe('t6');
    expect(ev.payload).toBe(6);
    expect(log.count()).toBe(1);
  });
  it('append test #7: appends event with type t7 and payload 7', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't7', payload: 7 });
    expect(ev.type).toBe('t7');
    expect(ev.payload).toBe(7);
    expect(log.count()).toBe(1);
  });
  it('append test #8: appends event with type t8 and payload 8', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't8', payload: 8 });
    expect(ev.type).toBe('t8');
    expect(ev.payload).toBe(8);
    expect(log.count()).toBe(1);
  });
  it('append test #9: appends event with type t9 and payload 9', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't9', payload: 9 });
    expect(ev.type).toBe('t9');
    expect(ev.payload).toBe(9);
    expect(log.count()).toBe(1);
  });
  it('append test #10: appends event with type t10 and payload 10', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't10', payload: 10 });
    expect(ev.type).toBe('t10');
    expect(ev.payload).toBe(10);
    expect(log.count()).toBe(1);
  });
  it('append test #11: appends event with type t11 and payload 11', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't11', payload: 11 });
    expect(ev.type).toBe('t11');
    expect(ev.payload).toBe(11);
    expect(log.count()).toBe(1);
  });
  it('append test #12: appends event with type t12 and payload 12', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't12', payload: 12 });
    expect(ev.type).toBe('t12');
    expect(ev.payload).toBe(12);
    expect(log.count()).toBe(1);
  });
  it('append test #13: appends event with type t13 and payload 13', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't13', payload: 13 });
    expect(ev.type).toBe('t13');
    expect(ev.payload).toBe(13);
    expect(log.count()).toBe(1);
  });
  it('append test #14: appends event with type t14 and payload 14', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't14', payload: 14 });
    expect(ev.type).toBe('t14');
    expect(ev.payload).toBe(14);
    expect(log.count()).toBe(1);
  });
  it('append test #15: appends event with type t15 and payload 15', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't15', payload: 15 });
    expect(ev.type).toBe('t15');
    expect(ev.payload).toBe(15);
    expect(log.count()).toBe(1);
  });
  it('append test #16: appends event with type t16 and payload 16', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't16', payload: 16 });
    expect(ev.type).toBe('t16');
    expect(ev.payload).toBe(16);
    expect(log.count()).toBe(1);
  });
  it('append test #17: appends event with type t17 and payload 17', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't17', payload: 17 });
    expect(ev.type).toBe('t17');
    expect(ev.payload).toBe(17);
    expect(log.count()).toBe(1);
  });
  it('append test #18: appends event with type t18 and payload 18', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't18', payload: 18 });
    expect(ev.type).toBe('t18');
    expect(ev.payload).toBe(18);
    expect(log.count()).toBe(1);
  });
  it('append test #19: appends event with type t19 and payload 19', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't19', payload: 19 });
    expect(ev.type).toBe('t19');
    expect(ev.payload).toBe(19);
    expect(log.count()).toBe(1);
  });
  it('append test #20: appends event with type t20 and payload 20', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't20', payload: 20 });
    expect(ev.type).toBe('t20');
    expect(ev.payload).toBe(20);
    expect(log.count()).toBe(1);
  });
  it('append test #21: appends event with type t21 and payload 21', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't21', payload: 21 });
    expect(ev.type).toBe('t21');
    expect(ev.payload).toBe(21);
    expect(log.count()).toBe(1);
  });
  it('append test #22: appends event with type t22 and payload 22', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't22', payload: 22 });
    expect(ev.type).toBe('t22');
    expect(ev.payload).toBe(22);
    expect(log.count()).toBe(1);
  });
  it('append test #23: appends event with type t23 and payload 23', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't23', payload: 23 });
    expect(ev.type).toBe('t23');
    expect(ev.payload).toBe(23);
    expect(log.count()).toBe(1);
  });
  it('append test #24: appends event with type t24 and payload 24', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't24', payload: 24 });
    expect(ev.type).toBe('t24');
    expect(ev.payload).toBe(24);
    expect(log.count()).toBe(1);
  });
  it('append test #25: appends event with type t25 and payload 25', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't25', payload: 25 });
    expect(ev.type).toBe('t25');
    expect(ev.payload).toBe(25);
    expect(log.count()).toBe(1);
  });
  it('append test #26: appends event with type t26 and payload 26', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't26', payload: 26 });
    expect(ev.type).toBe('t26');
    expect(ev.payload).toBe(26);
    expect(log.count()).toBe(1);
  });
  it('append test #27: appends event with type t27 and payload 27', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't27', payload: 27 });
    expect(ev.type).toBe('t27');
    expect(ev.payload).toBe(27);
    expect(log.count()).toBe(1);
  });
  it('append test #28: appends event with type t28 and payload 28', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't28', payload: 28 });
    expect(ev.type).toBe('t28');
    expect(ev.payload).toBe(28);
    expect(log.count()).toBe(1);
  });
  it('append test #29: appends event with type t29 and payload 29', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't29', payload: 29 });
    expect(ev.type).toBe('t29');
    expect(ev.payload).toBe(29);
    expect(log.count()).toBe(1);
  });
  it('append test #30: appends event with type t30 and payload 30', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't30', payload: 30 });
    expect(ev.type).toBe('t30');
    expect(ev.payload).toBe(30);
    expect(log.count()).toBe(1);
  });
  it('append test #31: appends event with type t31 and payload 31', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't31', payload: 31 });
    expect(ev.type).toBe('t31');
    expect(ev.payload).toBe(31);
    expect(log.count()).toBe(1);
  });
  it('append test #32: appends event with type t32 and payload 32', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't32', payload: 32 });
    expect(ev.type).toBe('t32');
    expect(ev.payload).toBe(32);
    expect(log.count()).toBe(1);
  });
  it('append test #33: appends event with type t33 and payload 33', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't33', payload: 33 });
    expect(ev.type).toBe('t33');
    expect(ev.payload).toBe(33);
    expect(log.count()).toBe(1);
  });
  it('append test #34: appends event with type t34 and payload 34', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't34', payload: 34 });
    expect(ev.type).toBe('t34');
    expect(ev.payload).toBe(34);
    expect(log.count()).toBe(1);
  });
  it('append test #35: appends event with type t35 and payload 35', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't35', payload: 35 });
    expect(ev.type).toBe('t35');
    expect(ev.payload).toBe(35);
    expect(log.count()).toBe(1);
  });
  it('append test #36: appends event with type t36 and payload 36', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't36', payload: 36 });
    expect(ev.type).toBe('t36');
    expect(ev.payload).toBe(36);
    expect(log.count()).toBe(1);
  });
  it('append test #37: appends event with type t37 and payload 37', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't37', payload: 37 });
    expect(ev.type).toBe('t37');
    expect(ev.payload).toBe(37);
    expect(log.count()).toBe(1);
  });
  it('append test #38: appends event with type t38 and payload 38', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't38', payload: 38 });
    expect(ev.type).toBe('t38');
    expect(ev.payload).toBe(38);
    expect(log.count()).toBe(1);
  });
  it('append test #39: appends event with type t39 and payload 39', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't39', payload: 39 });
    expect(ev.type).toBe('t39');
    expect(ev.payload).toBe(39);
    expect(log.count()).toBe(1);
  });
  it('append test #40: appends event with type t40 and payload 40', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't40', payload: 40 });
    expect(ev.type).toBe('t40');
    expect(ev.payload).toBe(40);
    expect(log.count()).toBe(1);
  });
  it('append test #41: appends event with type t41 and payload 41', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't41', payload: 41 });
    expect(ev.type).toBe('t41');
    expect(ev.payload).toBe(41);
    expect(log.count()).toBe(1);
  });
  it('append test #42: appends event with type t42 and payload 42', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't42', payload: 42 });
    expect(ev.type).toBe('t42');
    expect(ev.payload).toBe(42);
    expect(log.count()).toBe(1);
  });
  it('append test #43: appends event with type t43 and payload 43', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't43', payload: 43 });
    expect(ev.type).toBe('t43');
    expect(ev.payload).toBe(43);
    expect(log.count()).toBe(1);
  });
  it('append test #44: appends event with type t44 and payload 44', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't44', payload: 44 });
    expect(ev.type).toBe('t44');
    expect(ev.payload).toBe(44);
    expect(log.count()).toBe(1);
  });
  it('append test #45: appends event with type t45 and payload 45', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't45', payload: 45 });
    expect(ev.type).toBe('t45');
    expect(ev.payload).toBe(45);
    expect(log.count()).toBe(1);
  });
  it('append test #46: appends event with type t46 and payload 46', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't46', payload: 46 });
    expect(ev.type).toBe('t46');
    expect(ev.payload).toBe(46);
    expect(log.count()).toBe(1);
  });
  it('append test #47: appends event with type t47 and payload 47', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't47', payload: 47 });
    expect(ev.type).toBe('t47');
    expect(ev.payload).toBe(47);
    expect(log.count()).toBe(1);
  });
  it('append test #48: appends event with type t48 and payload 48', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't48', payload: 48 });
    expect(ev.type).toBe('t48');
    expect(ev.payload).toBe(48);
    expect(log.count()).toBe(1);
  });
  it('append test #49: appends event with type t49 and payload 49', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't49', payload: 49 });
    expect(ev.type).toBe('t49');
    expect(ev.payload).toBe(49);
    expect(log.count()).toBe(1);
  });
  it('append test #50: appends event with type t50 and payload 50', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't50', payload: 50 });
    expect(ev.type).toBe('t50');
    expect(ev.payload).toBe(50);
    expect(log.count()).toBe(1);
  });
  it('append test #51: appends event with type t51 and payload 51', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't51', payload: 51 });
    expect(ev.type).toBe('t51');
    expect(ev.payload).toBe(51);
    expect(log.count()).toBe(1);
  });
  it('append test #52: appends event with type t52 and payload 52', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't52', payload: 52 });
    expect(ev.type).toBe('t52');
    expect(ev.payload).toBe(52);
    expect(log.count()).toBe(1);
  });
  it('append test #53: appends event with type t53 and payload 53', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't53', payload: 53 });
    expect(ev.type).toBe('t53');
    expect(ev.payload).toBe(53);
    expect(log.count()).toBe(1);
  });
  it('append test #54: appends event with type t54 and payload 54', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't54', payload: 54 });
    expect(ev.type).toBe('t54');
    expect(ev.payload).toBe(54);
    expect(log.count()).toBe(1);
  });
  it('append test #55: appends event with type t55 and payload 55', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't55', payload: 55 });
    expect(ev.type).toBe('t55');
    expect(ev.payload).toBe(55);
    expect(log.count()).toBe(1);
  });
  it('append test #56: appends event with type t56 and payload 56', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't56', payload: 56 });
    expect(ev.type).toBe('t56');
    expect(ev.payload).toBe(56);
    expect(log.count()).toBe(1);
  });
  it('append test #57: appends event with type t57 and payload 57', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't57', payload: 57 });
    expect(ev.type).toBe('t57');
    expect(ev.payload).toBe(57);
    expect(log.count()).toBe(1);
  });
  it('append test #58: appends event with type t58 and payload 58', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't58', payload: 58 });
    expect(ev.type).toBe('t58');
    expect(ev.payload).toBe(58);
    expect(log.count()).toBe(1);
  });
  it('append test #59: appends event with type t59 and payload 59', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't59', payload: 59 });
    expect(ev.type).toBe('t59');
    expect(ev.payload).toBe(59);
    expect(log.count()).toBe(1);
  });
  it('append test #60: appends event with type t60 and payload 60', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't60', payload: 60 });
    expect(ev.type).toBe('t60');
    expect(ev.payload).toBe(60);
    expect(log.count()).toBe(1);
  });
  it('append test #61: appends event with type t61 and payload 61', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't61', payload: 61 });
    expect(ev.type).toBe('t61');
    expect(ev.payload).toBe(61);
    expect(log.count()).toBe(1);
  });
  it('append test #62: appends event with type t62 and payload 62', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't62', payload: 62 });
    expect(ev.type).toBe('t62');
    expect(ev.payload).toBe(62);
    expect(log.count()).toBe(1);
  });
  it('append test #63: appends event with type t63 and payload 63', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't63', payload: 63 });
    expect(ev.type).toBe('t63');
    expect(ev.payload).toBe(63);
    expect(log.count()).toBe(1);
  });
  it('append test #64: appends event with type t64 and payload 64', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't64', payload: 64 });
    expect(ev.type).toBe('t64');
    expect(ev.payload).toBe(64);
    expect(log.count()).toBe(1);
  });
  it('append test #65: appends event with type t65 and payload 65', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't65', payload: 65 });
    expect(ev.type).toBe('t65');
    expect(ev.payload).toBe(65);
    expect(log.count()).toBe(1);
  });
  it('append test #66: appends event with type t66 and payload 66', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't66', payload: 66 });
    expect(ev.type).toBe('t66');
    expect(ev.payload).toBe(66);
    expect(log.count()).toBe(1);
  });
  it('append test #67: appends event with type t67 and payload 67', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't67', payload: 67 });
    expect(ev.type).toBe('t67');
    expect(ev.payload).toBe(67);
    expect(log.count()).toBe(1);
  });
  it('append test #68: appends event with type t68 and payload 68', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't68', payload: 68 });
    expect(ev.type).toBe('t68');
    expect(ev.payload).toBe(68);
    expect(log.count()).toBe(1);
  });
  it('append test #69: appends event with type t69 and payload 69', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't69', payload: 69 });
    expect(ev.type).toBe('t69');
    expect(ev.payload).toBe(69);
    expect(log.count()).toBe(1);
  });
  it('append test #70: appends event with type t70 and payload 70', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't70', payload: 70 });
    expect(ev.type).toBe('t70');
    expect(ev.payload).toBe(70);
    expect(log.count()).toBe(1);
  });
  it('append test #71: appends event with type t71 and payload 71', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't71', payload: 71 });
    expect(ev.type).toBe('t71');
    expect(ev.payload).toBe(71);
    expect(log.count()).toBe(1);
  });
  it('append test #72: appends event with type t72 and payload 72', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't72', payload: 72 });
    expect(ev.type).toBe('t72');
    expect(ev.payload).toBe(72);
    expect(log.count()).toBe(1);
  });
  it('append test #73: appends event with type t73 and payload 73', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't73', payload: 73 });
    expect(ev.type).toBe('t73');
    expect(ev.payload).toBe(73);
    expect(log.count()).toBe(1);
  });
  it('append test #74: appends event with type t74 and payload 74', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't74', payload: 74 });
    expect(ev.type).toBe('t74');
    expect(ev.payload).toBe(74);
    expect(log.count()).toBe(1);
  });
  it('append test #75: appends event with type t75 and payload 75', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't75', payload: 75 });
    expect(ev.type).toBe('t75');
    expect(ev.payload).toBe(75);
    expect(log.count()).toBe(1);
  });
  it('append test #76: appends event with type t76 and payload 76', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't76', payload: 76 });
    expect(ev.type).toBe('t76');
    expect(ev.payload).toBe(76);
    expect(log.count()).toBe(1);
  });
  it('append test #77: appends event with type t77 and payload 77', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't77', payload: 77 });
    expect(ev.type).toBe('t77');
    expect(ev.payload).toBe(77);
    expect(log.count()).toBe(1);
  });
  it('append test #78: appends event with type t78 and payload 78', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't78', payload: 78 });
    expect(ev.type).toBe('t78');
    expect(ev.payload).toBe(78);
    expect(log.count()).toBe(1);
  });
  it('append test #79: appends event with type t79 and payload 79', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't79', payload: 79 });
    expect(ev.type).toBe('t79');
    expect(ev.payload).toBe(79);
    expect(log.count()).toBe(1);
  });
  it('append test #80: appends event with type t80 and payload 80', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't80', payload: 80 });
    expect(ev.type).toBe('t80');
    expect(ev.payload).toBe(80);
    expect(log.count()).toBe(1);
  });
  it('append test #81: appends event with type t81 and payload 81', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't81', payload: 81 });
    expect(ev.type).toBe('t81');
    expect(ev.payload).toBe(81);
    expect(log.count()).toBe(1);
  });
  it('append test #82: appends event with type t82 and payload 82', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't82', payload: 82 });
    expect(ev.type).toBe('t82');
    expect(ev.payload).toBe(82);
    expect(log.count()).toBe(1);
  });
  it('append test #83: appends event with type t83 and payload 83', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't83', payload: 83 });
    expect(ev.type).toBe('t83');
    expect(ev.payload).toBe(83);
    expect(log.count()).toBe(1);
  });
  it('append test #84: appends event with type t84 and payload 84', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't84', payload: 84 });
    expect(ev.type).toBe('t84');
    expect(ev.payload).toBe(84);
    expect(log.count()).toBe(1);
  });
  it('append test #85: appends event with type t85 and payload 85', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't85', payload: 85 });
    expect(ev.type).toBe('t85');
    expect(ev.payload).toBe(85);
    expect(log.count()).toBe(1);
  });
  it('append test #86: appends event with type t86 and payload 86', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't86', payload: 86 });
    expect(ev.type).toBe('t86');
    expect(ev.payload).toBe(86);
    expect(log.count()).toBe(1);
  });
  it('append test #87: appends event with type t87 and payload 87', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't87', payload: 87 });
    expect(ev.type).toBe('t87');
    expect(ev.payload).toBe(87);
    expect(log.count()).toBe(1);
  });
  it('append test #88: appends event with type t88 and payload 88', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't88', payload: 88 });
    expect(ev.type).toBe('t88');
    expect(ev.payload).toBe(88);
    expect(log.count()).toBe(1);
  });
  it('append test #89: appends event with type t89 and payload 89', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't89', payload: 89 });
    expect(ev.type).toBe('t89');
    expect(ev.payload).toBe(89);
    expect(log.count()).toBe(1);
  });
  it('append test #90: appends event with type t90 and payload 90', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't90', payload: 90 });
    expect(ev.type).toBe('t90');
    expect(ev.payload).toBe(90);
    expect(log.count()).toBe(1);
  });
  it('append test #91: appends event with type t91 and payload 91', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't91', payload: 91 });
    expect(ev.type).toBe('t91');
    expect(ev.payload).toBe(91);
    expect(log.count()).toBe(1);
  });
  it('append test #92: appends event with type t92 and payload 92', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't92', payload: 92 });
    expect(ev.type).toBe('t92');
    expect(ev.payload).toBe(92);
    expect(log.count()).toBe(1);
  });
  it('append test #93: appends event with type t93 and payload 93', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't93', payload: 93 });
    expect(ev.type).toBe('t93');
    expect(ev.payload).toBe(93);
    expect(log.count()).toBe(1);
  });
  it('append test #94: appends event with type t94 and payload 94', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't94', payload: 94 });
    expect(ev.type).toBe('t94');
    expect(ev.payload).toBe(94);
    expect(log.count()).toBe(1);
  });
  it('append test #95: appends event with type t95 and payload 95', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't95', payload: 95 });
    expect(ev.type).toBe('t95');
    expect(ev.payload).toBe(95);
    expect(log.count()).toBe(1);
  });
  it('append test #96: appends event with type t96 and payload 96', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't96', payload: 96 });
    expect(ev.type).toBe('t96');
    expect(ev.payload).toBe(96);
    expect(log.count()).toBe(1);
  });
  it('append test #97: appends event with type t97 and payload 97', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't97', payload: 97 });
    expect(ev.type).toBe('t97');
    expect(ev.payload).toBe(97);
    expect(log.count()).toBe(1);
  });
  it('append test #98: appends event with type t98 and payload 98', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't98', payload: 98 });
    expect(ev.type).toBe('t98');
    expect(ev.payload).toBe(98);
    expect(log.count()).toBe(1);
  });
  it('append test #99: appends event with type t99 and payload 99', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't99', payload: 99 });
    expect(ev.type).toBe('t99');
    expect(ev.payload).toBe(99);
    expect(log.count()).toBe(1);
  });
  it('append test #100: appends event with type t100 and payload 100', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't100', payload: 100 });
    expect(ev.type).toBe('t100');
    expect(ev.payload).toBe(100);
    expect(log.count()).toBe(1);
  });
  it('append test #101: appends event with type t101 and payload 101', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't101', payload: 101 });
    expect(ev.type).toBe('t101');
    expect(ev.payload).toBe(101);
    expect(log.count()).toBe(1);
  });
  it('append test #102: appends event with type t102 and payload 102', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't102', payload: 102 });
    expect(ev.type).toBe('t102');
    expect(ev.payload).toBe(102);
    expect(log.count()).toBe(1);
  });
  it('append test #103: appends event with type t103 and payload 103', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't103', payload: 103 });
    expect(ev.type).toBe('t103');
    expect(ev.payload).toBe(103);
    expect(log.count()).toBe(1);
  });
  it('append test #104: appends event with type t104 and payload 104', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't104', payload: 104 });
    expect(ev.type).toBe('t104');
    expect(ev.payload).toBe(104);
    expect(log.count()).toBe(1);
  });
  it('append test #105: appends event with type t105 and payload 105', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't105', payload: 105 });
    expect(ev.type).toBe('t105');
    expect(ev.payload).toBe(105);
    expect(log.count()).toBe(1);
  });
  it('append test #106: appends event with type t106 and payload 106', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't106', payload: 106 });
    expect(ev.type).toBe('t106');
    expect(ev.payload).toBe(106);
    expect(log.count()).toBe(1);
  });
  it('append test #107: appends event with type t107 and payload 107', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't107', payload: 107 });
    expect(ev.type).toBe('t107');
    expect(ev.payload).toBe(107);
    expect(log.count()).toBe(1);
  });
  it('append test #108: appends event with type t108 and payload 108', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't108', payload: 108 });
    expect(ev.type).toBe('t108');
    expect(ev.payload).toBe(108);
    expect(log.count()).toBe(1);
  });
  it('append test #109: appends event with type t109 and payload 109', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't109', payload: 109 });
    expect(ev.type).toBe('t109');
    expect(ev.payload).toBe(109);
    expect(log.count()).toBe(1);
  });
  it('append test #110: appends event with type t110 and payload 110', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't110', payload: 110 });
    expect(ev.type).toBe('t110');
    expect(ev.payload).toBe(110);
    expect(log.count()).toBe(1);
  });
  it('append test #111: appends event with type t111 and payload 111', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't111', payload: 111 });
    expect(ev.type).toBe('t111');
    expect(ev.payload).toBe(111);
    expect(log.count()).toBe(1);
  });
  it('append test #112: appends event with type t112 and payload 112', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't112', payload: 112 });
    expect(ev.type).toBe('t112');
    expect(ev.payload).toBe(112);
    expect(log.count()).toBe(1);
  });
  it('append test #113: appends event with type t113 and payload 113', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't113', payload: 113 });
    expect(ev.type).toBe('t113');
    expect(ev.payload).toBe(113);
    expect(log.count()).toBe(1);
  });
  it('append test #114: appends event with type t114 and payload 114', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't114', payload: 114 });
    expect(ev.type).toBe('t114');
    expect(ev.payload).toBe(114);
    expect(log.count()).toBe(1);
  });
  it('append test #115: appends event with type t115 and payload 115', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't115', payload: 115 });
    expect(ev.type).toBe('t115');
    expect(ev.payload).toBe(115);
    expect(log.count()).toBe(1);
  });
  it('append test #116: appends event with type t116 and payload 116', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't116', payload: 116 });
    expect(ev.type).toBe('t116');
    expect(ev.payload).toBe(116);
    expect(log.count()).toBe(1);
  });
  it('append test #117: appends event with type t117 and payload 117', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't117', payload: 117 });
    expect(ev.type).toBe('t117');
    expect(ev.payload).toBe(117);
    expect(log.count()).toBe(1);
  });
  it('append test #118: appends event with type t118 and payload 118', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't118', payload: 118 });
    expect(ev.type).toBe('t118');
    expect(ev.payload).toBe(118);
    expect(log.count()).toBe(1);
  });
  it('append test #119: appends event with type t119 and payload 119', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't119', payload: 119 });
    expect(ev.type).toBe('t119');
    expect(ev.payload).toBe(119);
    expect(log.count()).toBe(1);
  });
  it('append test #120: appends event with type t120 and payload 120', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't120', payload: 120 });
    expect(ev.type).toBe('t120');
    expect(ev.payload).toBe(120);
    expect(log.count()).toBe(1);
  });
  it('append test #121: appends event with type t121 and payload 121', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't121', payload: 121 });
    expect(ev.type).toBe('t121');
    expect(ev.payload).toBe(121);
    expect(log.count()).toBe(1);
  });
  it('append test #122: appends event with type t122 and payload 122', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't122', payload: 122 });
    expect(ev.type).toBe('t122');
    expect(ev.payload).toBe(122);
    expect(log.count()).toBe(1);
  });
  it('append test #123: appends event with type t123 and payload 123', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't123', payload: 123 });
    expect(ev.type).toBe('t123');
    expect(ev.payload).toBe(123);
    expect(log.count()).toBe(1);
  });
  it('append test #124: appends event with type t124 and payload 124', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't124', payload: 124 });
    expect(ev.type).toBe('t124');
    expect(ev.payload).toBe(124);
    expect(log.count()).toBe(1);
  });
  it('append test #125: appends event with type t125 and payload 125', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't125', payload: 125 });
    expect(ev.type).toBe('t125');
    expect(ev.payload).toBe(125);
    expect(log.count()).toBe(1);
  });
  it('append test #126: appends event with type t126 and payload 126', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't126', payload: 126 });
    expect(ev.type).toBe('t126');
    expect(ev.payload).toBe(126);
    expect(log.count()).toBe(1);
  });
  it('append test #127: appends event with type t127 and payload 127', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't127', payload: 127 });
    expect(ev.type).toBe('t127');
    expect(ev.payload).toBe(127);
    expect(log.count()).toBe(1);
  });
  it('append test #128: appends event with type t128 and payload 128', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't128', payload: 128 });
    expect(ev.type).toBe('t128');
    expect(ev.payload).toBe(128);
    expect(log.count()).toBe(1);
  });
  it('append test #129: appends event with type t129 and payload 129', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't129', payload: 129 });
    expect(ev.type).toBe('t129');
    expect(ev.payload).toBe(129);
    expect(log.count()).toBe(1);
  });
  it('append test #130: appends event with type t130 and payload 130', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't130', payload: 130 });
    expect(ev.type).toBe('t130');
    expect(ev.payload).toBe(130);
    expect(log.count()).toBe(1);
  });
  it('append test #131: appends event with type t131 and payload 131', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't131', payload: 131 });
    expect(ev.type).toBe('t131');
    expect(ev.payload).toBe(131);
    expect(log.count()).toBe(1);
  });
  it('append test #132: appends event with type t132 and payload 132', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't132', payload: 132 });
    expect(ev.type).toBe('t132');
    expect(ev.payload).toBe(132);
    expect(log.count()).toBe(1);
  });
  it('append test #133: appends event with type t133 and payload 133', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't133', payload: 133 });
    expect(ev.type).toBe('t133');
    expect(ev.payload).toBe(133);
    expect(log.count()).toBe(1);
  });
  it('append test #134: appends event with type t134 and payload 134', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't134', payload: 134 });
    expect(ev.type).toBe('t134');
    expect(ev.payload).toBe(134);
    expect(log.count()).toBe(1);
  });
  it('append test #135: appends event with type t135 and payload 135', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't135', payload: 135 });
    expect(ev.type).toBe('t135');
    expect(ev.payload).toBe(135);
    expect(log.count()).toBe(1);
  });
  it('append test #136: appends event with type t136 and payload 136', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't136', payload: 136 });
    expect(ev.type).toBe('t136');
    expect(ev.payload).toBe(136);
    expect(log.count()).toBe(1);
  });
  it('append test #137: appends event with type t137 and payload 137', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't137', payload: 137 });
    expect(ev.type).toBe('t137');
    expect(ev.payload).toBe(137);
    expect(log.count()).toBe(1);
  });
  it('append test #138: appends event with type t138 and payload 138', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't138', payload: 138 });
    expect(ev.type).toBe('t138');
    expect(ev.payload).toBe(138);
    expect(log.count()).toBe(1);
  });
  it('append test #139: appends event with type t139 and payload 139', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't139', payload: 139 });
    expect(ev.type).toBe('t139');
    expect(ev.payload).toBe(139);
    expect(log.count()).toBe(1);
  });
  it('append test #140: appends event with type t140 and payload 140', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't140', payload: 140 });
    expect(ev.type).toBe('t140');
    expect(ev.payload).toBe(140);
    expect(log.count()).toBe(1);
  });
  it('append test #141: appends event with type t141 and payload 141', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't141', payload: 141 });
    expect(ev.type).toBe('t141');
    expect(ev.payload).toBe(141);
    expect(log.count()).toBe(1);
  });
  it('append test #142: appends event with type t142 and payload 142', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't142', payload: 142 });
    expect(ev.type).toBe('t142');
    expect(ev.payload).toBe(142);
    expect(log.count()).toBe(1);
  });
  it('append test #143: appends event with type t143 and payload 143', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't143', payload: 143 });
    expect(ev.type).toBe('t143');
    expect(ev.payload).toBe(143);
    expect(log.count()).toBe(1);
  });
  it('append test #144: appends event with type t144 and payload 144', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't144', payload: 144 });
    expect(ev.type).toBe('t144');
    expect(ev.payload).toBe(144);
    expect(log.count()).toBe(1);
  });
  it('append test #145: appends event with type t145 and payload 145', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't145', payload: 145 });
    expect(ev.type).toBe('t145');
    expect(ev.payload).toBe(145);
    expect(log.count()).toBe(1);
  });
  it('append test #146: appends event with type t146 and payload 146', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't146', payload: 146 });
    expect(ev.type).toBe('t146');
    expect(ev.payload).toBe(146);
    expect(log.count()).toBe(1);
  });
  it('append test #147: appends event with type t147 and payload 147', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't147', payload: 147 });
    expect(ev.type).toBe('t147');
    expect(ev.payload).toBe(147);
    expect(log.count()).toBe(1);
  });
  it('append test #148: appends event with type t148 and payload 148', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't148', payload: 148 });
    expect(ev.type).toBe('t148');
    expect(ev.payload).toBe(148);
    expect(log.count()).toBe(1);
  });
  it('append test #149: appends event with type t149 and payload 149', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't149', payload: 149 });
    expect(ev.type).toBe('t149');
    expect(ev.payload).toBe(149);
    expect(log.count()).toBe(1);
  });
  it('append test #150: appends event with type t150 and payload 150', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't150', payload: 150 });
    expect(ev.type).toBe('t150');
    expect(ev.payload).toBe(150);
    expect(log.count()).toBe(1);
  });
  it('append test #151: appends event with type t151 and payload 151', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't151', payload: 151 });
    expect(ev.type).toBe('t151');
    expect(ev.payload).toBe(151);
    expect(log.count()).toBe(1);
  });
  it('append test #152: appends event with type t152 and payload 152', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't152', payload: 152 });
    expect(ev.type).toBe('t152');
    expect(ev.payload).toBe(152);
    expect(log.count()).toBe(1);
  });
  it('append test #153: appends event with type t153 and payload 153', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't153', payload: 153 });
    expect(ev.type).toBe('t153');
    expect(ev.payload).toBe(153);
    expect(log.count()).toBe(1);
  });
  it('append test #154: appends event with type t154 and payload 154', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't154', payload: 154 });
    expect(ev.type).toBe('t154');
    expect(ev.payload).toBe(154);
    expect(log.count()).toBe(1);
  });
  it('append test #155: appends event with type t155 and payload 155', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't155', payload: 155 });
    expect(ev.type).toBe('t155');
    expect(ev.payload).toBe(155);
    expect(log.count()).toBe(1);
  });
  it('append test #156: appends event with type t156 and payload 156', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't156', payload: 156 });
    expect(ev.type).toBe('t156');
    expect(ev.payload).toBe(156);
    expect(log.count()).toBe(1);
  });
  it('append test #157: appends event with type t157 and payload 157', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't157', payload: 157 });
    expect(ev.type).toBe('t157');
    expect(ev.payload).toBe(157);
    expect(log.count()).toBe(1);
  });
  it('append test #158: appends event with type t158 and payload 158', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't158', payload: 158 });
    expect(ev.type).toBe('t158');
    expect(ev.payload).toBe(158);
    expect(log.count()).toBe(1);
  });
  it('append test #159: appends event with type t159 and payload 159', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't159', payload: 159 });
    expect(ev.type).toBe('t159');
    expect(ev.payload).toBe(159);
    expect(log.count()).toBe(1);
  });
  it('append test #160: appends event with type t160 and payload 160', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't160', payload: 160 });
    expect(ev.type).toBe('t160');
    expect(ev.payload).toBe(160);
    expect(log.count()).toBe(1);
  });
  it('append test #161: appends event with type t161 and payload 161', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't161', payload: 161 });
    expect(ev.type).toBe('t161');
    expect(ev.payload).toBe(161);
    expect(log.count()).toBe(1);
  });
  it('append test #162: appends event with type t162 and payload 162', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't162', payload: 162 });
    expect(ev.type).toBe('t162');
    expect(ev.payload).toBe(162);
    expect(log.count()).toBe(1);
  });
  it('append test #163: appends event with type t163 and payload 163', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't163', payload: 163 });
    expect(ev.type).toBe('t163');
    expect(ev.payload).toBe(163);
    expect(log.count()).toBe(1);
  });
  it('append test #164: appends event with type t164 and payload 164', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't164', payload: 164 });
    expect(ev.type).toBe('t164');
    expect(ev.payload).toBe(164);
    expect(log.count()).toBe(1);
  });
  it('append test #165: appends event with type t165 and payload 165', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't165', payload: 165 });
    expect(ev.type).toBe('t165');
    expect(ev.payload).toBe(165);
    expect(log.count()).toBe(1);
  });
  it('append test #166: appends event with type t166 and payload 166', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't166', payload: 166 });
    expect(ev.type).toBe('t166');
    expect(ev.payload).toBe(166);
    expect(log.count()).toBe(1);
  });
  it('append test #167: appends event with type t167 and payload 167', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't167', payload: 167 });
    expect(ev.type).toBe('t167');
    expect(ev.payload).toBe(167);
    expect(log.count()).toBe(1);
  });
  it('append test #168: appends event with type t168 and payload 168', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't168', payload: 168 });
    expect(ev.type).toBe('t168');
    expect(ev.payload).toBe(168);
    expect(log.count()).toBe(1);
  });
  it('append test #169: appends event with type t169 and payload 169', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't169', payload: 169 });
    expect(ev.type).toBe('t169');
    expect(ev.payload).toBe(169);
    expect(log.count()).toBe(1);
  });
  it('append test #170: appends event with type t170 and payload 170', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't170', payload: 170 });
    expect(ev.type).toBe('t170');
    expect(ev.payload).toBe(170);
    expect(log.count()).toBe(1);
  });
  it('append test #171: appends event with type t171 and payload 171', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't171', payload: 171 });
    expect(ev.type).toBe('t171');
    expect(ev.payload).toBe(171);
    expect(log.count()).toBe(1);
  });
  it('append test #172: appends event with type t172 and payload 172', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't172', payload: 172 });
    expect(ev.type).toBe('t172');
    expect(ev.payload).toBe(172);
    expect(log.count()).toBe(1);
  });
  it('append test #173: appends event with type t173 and payload 173', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't173', payload: 173 });
    expect(ev.type).toBe('t173');
    expect(ev.payload).toBe(173);
    expect(log.count()).toBe(1);
  });
  it('append test #174: appends event with type t174 and payload 174', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't174', payload: 174 });
    expect(ev.type).toBe('t174');
    expect(ev.payload).toBe(174);
    expect(log.count()).toBe(1);
  });
  it('append test #175: appends event with type t175 and payload 175', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't175', payload: 175 });
    expect(ev.type).toBe('t175');
    expect(ev.payload).toBe(175);
    expect(log.count()).toBe(1);
  });
  it('append test #176: appends event with type t176 and payload 176', () => {
    const log = createEventLog();
    const ev = log.append({ type: 't176', payload: 176 });
    expect(ev.type).toBe('t176');
    expect(ev.payload).toBe(176);
    expect(log.count()).toBe(1);
  });
});

// ─── Section 2: getByType / getById (150 tests) ───
describe('createEventLog - getByType / getById', () => {
  it('getById returns undefined for missing id', () => {
    const log = createEventLog();
    expect(log.getById('nonexistent')).toBeUndefined();
  });
  it('getById returns the correct event', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'a', payload: 1 });
    expect(log.getById(ev.id)).toEqual(ev);
  });
  it('getById returns undefined after clear', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'a', payload: 1 });
    log.clear();
    expect(log.getById(ev.id)).toBeUndefined();
  });
  it('getByType returns empty array if no match', () => {
    const log = createEventLog();
    log.append({ type: 'click', payload: null });
    expect(log.getByType('hover')).toEqual([]);
  });
  it('getByType returns all matching events', () => {
    const log = createEventLog();
    log.append({ type: 'click', payload: 1 });
    log.append({ type: 'hover', payload: 2 });
    log.append({ type: 'click', payload: 3 });
    expect(log.getByType('click').length).toBe(2);
  });
  it('getByType events all have correct type', () => {
    const log = createEventLog();
    log.append({ type: 'click', payload: 1 });
    log.append({ type: 'click', payload: 2 });
    const evs = log.getByType('click');
    expect(evs.every(e => e.type === 'click')).toBe(true);
  });
  it('getByType returns empty after clear', () => {
    const log = createEventLog();
    log.append({ type: 'click', payload: 1 });
    log.clear();
    expect(log.getByType('click')).toEqual([]);
  });
  it('getById finds correct event among many', () => {
    const log = createEventLog();
    for (let i = 0; i < 5; i++) log.append({ type: `t${i}`, payload: i });
    const all = log.getAll();
    const target = all[2];
    expect(log.getById(target.id)).toEqual(target);
  });
  it('getByType is case sensitive', () => {
    const log = createEventLog();
    log.append({ type: 'Click', payload: null });
    expect(log.getByType('click')).toEqual([]);
  });
  it('getByType with empty string matches events with empty type', () => {
    const log = createEventLog();
    log.append({ type: '', payload: null });
    expect(log.getByType('').length).toBe(1);
  });
  it('getByType test #1: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 1 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #2: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 2 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #3: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 3 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #4: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 4 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #5: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 5 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #6: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 6 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #7: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 7 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #8: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 8 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #9: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 9 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #10: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 10 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #11: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 11 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #12: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 12 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #13: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 13 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #14: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 14 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #15: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 15 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #16: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 16 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #17: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 17 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #18: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 18 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #19: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 19 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #20: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 20 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #21: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 21 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #22: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 22 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #23: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 23 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #24: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 24 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #25: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 25 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #26: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 26 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #27: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 27 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #28: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 28 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #29: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 29 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #30: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 30 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #31: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 31 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #32: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 32 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #33: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 33 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #34: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 34 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #35: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 35 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #36: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 36 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #37: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 37 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #38: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 38 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #39: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 39 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #40: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 40 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #41: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 41 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #42: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 42 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #43: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 43 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #44: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 44 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #45: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 45 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #46: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 46 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #47: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 47 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #48: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 48 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #49: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 49 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #50: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 50 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #51: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 51 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #52: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 52 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #53: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 53 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #54: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 54 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #55: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 55 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #56: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 56 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #57: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 57 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #58: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 58 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #59: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 59 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #60: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 60 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #61: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 61 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #62: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 62 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #63: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 63 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #64: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 64 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #65: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 65 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #66: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 66 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #67: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 67 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #68: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 68 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #69: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 69 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #70: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 70 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #71: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 71 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #72: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 72 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #73: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 73 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #74: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 74 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #75: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 75 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #76: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 76 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #77: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 77 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #78: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 78 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #79: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 79 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #80: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 80 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #81: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 81 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #82: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 82 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #83: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 83 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #84: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 84 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #85: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 85 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #86: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 86 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #87: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 87 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #88: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 88 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #89: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 89 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #90: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 90 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #91: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 91 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #92: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 92 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #93: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 93 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #94: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 94 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #95: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 95 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #96: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 96 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #97: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 97 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #98: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 98 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #99: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 99 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #100: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 100 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #101: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 101 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #102: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 102 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #103: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 103 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #104: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 104 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #105: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 105 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #106: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 106 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #107: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 107 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #108: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 108 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #109: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 109 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #110: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 110 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #111: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 111 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #112: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 112 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #113: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 113 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #114: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 114 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #115: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 115 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #116: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 116 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #117: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 117 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #118: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 118 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #119: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 119 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #120: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 120 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #121: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 121 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #122: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 122 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #123: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 123 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #124: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 124 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #125: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 125 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #126: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 126 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #127: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 127 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #128: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 128 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #129: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 129 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #130: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 130 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #131: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 131 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #132: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 132 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #133: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 133 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #134: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 134 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #135: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 135 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #136: type "type1" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type1', payload: 136 });
    const found = log.getByType('type1');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #137: type "type2" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type2', payload: 137 });
    const found = log.getByType('type2');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #138: type "type3" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type3', payload: 138 });
    const found = log.getByType('type3');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #139: type "type4" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type4', payload: 139 });
    const found = log.getByType('type4');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
  it('getByType test #140: type "type0" returned correctly', () => {
    const log = createEventLog();
    const ev = log.append({ type: 'type0', payload: 140 });
    const found = log.getByType('type0');
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(ev.id);
    expect(log.getById(ev.id)).toBeDefined();
  });
});

// ─── Section 3: getAfter / getBefore / getBetween / slice (150 tests) ───
describe('createEventLog - time filters and slice', () => {
  function buildLog(count: number, base = 1000000, inc = 1000): { log: ReturnType<typeof createEventLog>, events: ReturnType<typeof createEventLog>['getAll'] } {
    // We'll use a workaround: create events using the internal append,
    // then use deserializeLog to get controlled timestamps.
    const rawEvents: any[] = [];
    for (let i = 0; i < count; i++) {
      rawEvents.push({ id: `id-${i}`, timestamp: base + i * inc, type: `type${i % 3}`, payload: i });
    }
    const log = createEventLog();
    // Use deserialization to inject raw events
    const data = JSON.stringify(rawEvents);
    const restored = deserializeLog(data);
    return { log: restored, events: restored.getAll() };
  }

  it('getAfter returns events strictly after timestamp', () => {
    const { log, events } = buildLog(5);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
  });
  it('getAfter excludes event exactly at timestamp', () => {
    const { log, events } = buildLog(3);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.id !== events[1].id)).toBe(true);
  });
  it('getAfter with very high timestamp returns empty', () => {
    const { log } = buildLog(3);
    expect(log.getAfter(9999999999)).toEqual([]);
  });
  it('getAfter with very low timestamp returns all', () => {
    const { log, events } = buildLog(3);
    expect(log.getAfter(0).length).toBe(events.length);
  });
  it('getBefore returns events strictly before timestamp', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('getBefore excludes event exactly at timestamp', () => {
    const { log, events } = buildLog(3);
    const ts = events[1].timestamp;
    const before = log.getBefore(ts);
    expect(before.every(e => e.id !== events[1].id)).toBe(true);
  });
  it('getBefore with very low timestamp returns empty', () => {
    const { log } = buildLog(3);
    expect(log.getBefore(0)).toEqual([]);
  });
  it('getBefore with very high timestamp returns all', () => {
    const { log, events } = buildLog(3);
    expect(log.getBefore(9999999999).length).toBe(events.length);
  });
  it('getBetween returns events within inclusive range', () => {
    const { log, events } = buildLog(5);
    const from = events[1].timestamp;
    const to = events[3].timestamp;
    const between = log.getBetween(from, to);
    expect(between.every(e => e.timestamp >= from && e.timestamp <= to)).toBe(true);
  });
  it('getBetween includes events at from and to boundaries', () => {
    const { log, events } = buildLog(5);
    const from = events[1].timestamp;
    const to = events[3].timestamp;
    const between = log.getBetween(from, to);
    expect(between.some(e => e.id === events[1].id)).toBe(true);
    expect(between.some(e => e.id === events[3].id)).toBe(true);
  });
  it('getBetween with equal from and to returns single event', () => {
    const { log, events } = buildLog(5);
    const ts = events[2].timestamp;
    const between = log.getBetween(ts, ts);
    expect(between.length).toBe(1);
  });
  it('getBetween with inverted range returns empty', () => {
    const { log, events } = buildLog(5);
    const between = log.getBetween(events[3].timestamp, events[1].timestamp);
    expect(between).toEqual([]);
  });
  it('slice with no end returns from index to end', () => {
    const { log, events } = buildLog(5);
    const sliced = log.slice(2);
    expect(sliced.length).toBe(events.length - 2);
  });
  it('slice with from=0 and to=2 returns first 2 events', () => {
    const { log } = buildLog(5);
    const sliced = log.slice(0, 2);
    expect(sliced.length).toBe(2);
  });
  it('slice with out-of-bounds from returns empty', () => {
    const { log } = buildLog(3);
    const sliced = log.slice(10);
    expect(sliced).toEqual([]);
  });
  it('time filter test #1: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #2: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #3: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #4: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[4].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #5: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #6: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #7: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #8: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #9: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #10: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #11: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #12: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #13: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #14: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #15: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #16: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #17: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #18: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #19: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #20: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #21: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #22: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #23: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #24: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #25: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #26: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #27: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #28: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #29: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[5].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #30: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #31: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #32: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #33: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #34: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[4].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #35: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #36: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #37: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #38: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #39: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #40: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #41: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #42: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #43: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #44: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #45: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #46: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #47: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #48: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #49: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #50: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #51: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #52: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #53: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #54: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #55: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #56: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #57: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #58: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #59: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[5].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #60: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #61: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #62: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #63: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #64: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[4].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #65: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #66: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #67: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #68: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #69: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #70: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #71: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #72: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #73: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #74: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #75: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #76: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #77: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #78: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #79: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #80: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #81: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #82: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #83: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #84: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #85: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #86: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #87: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #88: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #89: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[5].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #90: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #91: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #92: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #93: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #94: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[4].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #95: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #96: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #97: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #98: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #99: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #100: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #101: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #102: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #103: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #104: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #105: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #106: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #107: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #108: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #109: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #110: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #111: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #112: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #113: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #114: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #115: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #116: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #117: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #118: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #119: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[5].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #120: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #121: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #122: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #123: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #124: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[4].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #125: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #126: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #127: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #128: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #129: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #130: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #131: getAfter with 3 events', () => {
    const { log, events } = buildLog(3);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #132: getAfter with 4 events', () => {
    const { log, events } = buildLog(4);
    const ts = events[0].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #133: getAfter with 5 events', () => {
    const { log, events } = buildLog(5);
    const ts = events[3].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #134: getAfter with 6 events', () => {
    const { log, events } = buildLog(6);
    const ts = events[2].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
  it('time filter test #135: getAfter with 2 events', () => {
    const { log, events } = buildLog(2);
    const ts = events[1].timestamp;
    const after = log.getAfter(ts);
    expect(after.every(e => e.timestamp > ts)).toBe(true);
    const before = log.getBefore(ts);
    expect(before.every(e => e.timestamp < ts)).toBe(true);
  });
});

// ─── Section 4: createReplay (200 tests) ───
describe('createReplay', () => {
  function buildLogN(n: number): ReturnType<typeof createEventLog> {
    const raw: any[] = [];
    for (let i = 0; i < n; i++) {
      raw.push({ id: `rid-${i}`, timestamp: 1000000 + i * 1000, type: `t${i % 3}`, payload: i });
    }
    return deserializeLog(JSON.stringify(raw));
  }

  it('total() equals number of events in log', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
  });
  it('position() starts at 0', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.position()).toBe(0);
  });
  it('hasNext() is true for non-empty log at start', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.hasNext()).toBe(true);
  });
  it('hasNext() is false for empty log', () => {
    const log = buildLogN(0);
    const replay = createReplay(log);
    expect(replay.hasNext()).toBe(false);
  });
  it('next() returns first event', () => {
    const log = buildLogN(3);
    const all = log.getAll();
    const replay = createReplay(log);
    const ev = replay.next();
    expect(ev).toEqual(all[0]);
  });
  it('next() returns null when exhausted', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    replay.next();
    replay.next();
    expect(replay.next()).toBeNull();
  });
  it('position() advances after next()', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    replay.next();
    expect(replay.position()).toBe(1);
  });
  it('reset() returns position to 0', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    replay.next();
    replay.next();
    replay.reset();
    expect(replay.position()).toBe(0);
  });
  it('reset() makes hasNext() true again', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    replay.next();
    replay.next();
    replay.reset();
    expect(replay.hasNext()).toBe(true);
  });
  it('seek() to middle sets position', () => {
    const log = buildLogN(10);
    const replay = createReplay(log);
    replay.seek(5);
    expect(replay.position()).toBe(5);
  });
  it('seek() to 0 resets to start', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    replay.next();
    replay.seek(0);
    expect(replay.position()).toBe(0);
  });
  it('seek() to total sets position to end', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    replay.seek(5);
    expect(replay.hasNext()).toBe(false);
  });
  it('seek() beyond total clamps to total', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    replay.seek(100);
    expect(replay.position()).toBe(5);
  });
  it('seek() below 0 clamps to 0', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    replay.seek(-5);
    expect(replay.position()).toBe(0);
  });
  it('remaining() equals total at start', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.remaining()).toBe(5);
  });
  it('remaining() decrements after next()', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    replay.next();
    expect(replay.remaining()).toBe(4);
  });
  it('remaining() is 0 when exhausted', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    replay.next(); replay.next(); replay.next();
    expect(replay.remaining()).toBe(0);
  });
  it('startAt option filters out events before startAt', () => {
    const log = buildLogN(5);
    const all = log.getAll();
    const startAt = all[2].timestamp;
    const replay = createReplay(log, { startAt });
    expect(replay.total()).toBe(3);
  });
  it('endAt option filters out events after endAt', () => {
    const log = buildLogN(5);
    const all = log.getAll();
    const endAt = all[2].timestamp;
    const replay = createReplay(log, { endAt });
    expect(replay.total()).toBe(3);
  });
  it('startAt and endAt together filter correctly', () => {
    const log = buildLogN(5);
    const all = log.getAll();
    const startAt = all[1].timestamp;
    const endAt = all[3].timestamp;
    const replay = createReplay(log, { startAt, endAt });
    expect(replay.total()).toBe(3);
  });
  it('replay test #1: n=3 events, seek to 1', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(1);
    expect(replay.position()).toBe(1);
    expect(replay.remaining()).toBe(3 - 1);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #2: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #3: n=5 events, seek to 3', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(3);
    expect(replay.position()).toBe(3);
    expect(replay.remaining()).toBe(5 - 3);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #4: n=6 events, seek to 4', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(6 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #5: n=7 events, seek to 5', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(5);
    expect(replay.position()).toBe(5);
    expect(replay.remaining()).toBe(7 - 5);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #6: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #7: n=9 events, seek to 7', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(7);
    expect(replay.position()).toBe(7);
    expect(replay.remaining()).toBe(9 - 7);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #8: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #9: n=3 events, seek to 0', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(3 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #10: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #11: n=5 events, seek to 1', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(1);
    expect(replay.position()).toBe(1);
    expect(replay.remaining()).toBe(5 - 1);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #12: n=6 events, seek to 0', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(6 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #13: n=7 events, seek to 6', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(7 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #14: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #15: n=9 events, seek to 6', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(9 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #16: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #17: n=3 events, seek to 2', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(3 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #18: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #19: n=5 events, seek to 4', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(5 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #20: n=6 events, seek to 2', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(6 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #21: n=7 events, seek to 0', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(7 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #22: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #23: n=9 events, seek to 5', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(5);
    expect(replay.position()).toBe(5);
    expect(replay.remaining()).toBe(9 - 5);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #24: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #25: n=3 events, seek to 1', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(1);
    expect(replay.position()).toBe(1);
    expect(replay.remaining()).toBe(3 - 1);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #26: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #27: n=5 events, seek to 2', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(5 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #28: n=6 events, seek to 4', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(6 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #29: n=7 events, seek to 1', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(1);
    expect(replay.position()).toBe(1);
    expect(replay.remaining()).toBe(7 - 1);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #30: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #31: n=9 events, seek to 4', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(9 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #32: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #33: n=3 events, seek to 0', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(3 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #34: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #35: n=5 events, seek to 0', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(5 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #36: n=6 events, seek to 0', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(6 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #37: n=7 events, seek to 2', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(7 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #38: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #39: n=9 events, seek to 3', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(3);
    expect(replay.position()).toBe(3);
    expect(replay.remaining()).toBe(9 - 3);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #40: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #41: n=3 events, seek to 2', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(3 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #42: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #43: n=5 events, seek to 3', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(3);
    expect(replay.position()).toBe(3);
    expect(replay.remaining()).toBe(5 - 3);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #44: n=6 events, seek to 2', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(6 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #45: n=7 events, seek to 3', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(3);
    expect(replay.position()).toBe(3);
    expect(replay.remaining()).toBe(7 - 3);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #46: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #47: n=9 events, seek to 2', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(9 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #48: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #49: n=3 events, seek to 1', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(1);
    expect(replay.position()).toBe(1);
    expect(replay.remaining()).toBe(3 - 1);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #50: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #51: n=5 events, seek to 1', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(1);
    expect(replay.position()).toBe(1);
    expect(replay.remaining()).toBe(5 - 1);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #52: n=6 events, seek to 4', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(6 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #53: n=7 events, seek to 4', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(7 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #54: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #55: n=9 events, seek to 1', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(1);
    expect(replay.position()).toBe(1);
    expect(replay.remaining()).toBe(9 - 1);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #56: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #57: n=3 events, seek to 0', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(3 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #58: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #59: n=5 events, seek to 4', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(5 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #60: n=6 events, seek to 0', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(6 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #61: n=7 events, seek to 5', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(5);
    expect(replay.position()).toBe(5);
    expect(replay.remaining()).toBe(7 - 5);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #62: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #63: n=9 events, seek to 0', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(9 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #64: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #65: n=3 events, seek to 2', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(3 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #66: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #67: n=5 events, seek to 2', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(5 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #68: n=6 events, seek to 2', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(6 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #69: n=7 events, seek to 6', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(7 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #70: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #71: n=9 events, seek to 8', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(8);
    expect(replay.position()).toBe(8);
    expect(replay.remaining()).toBe(9 - 8);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #72: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #73: n=3 events, seek to 1', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(1);
    expect(replay.position()).toBe(1);
    expect(replay.remaining()).toBe(3 - 1);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #74: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #75: n=5 events, seek to 0', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(5 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #76: n=6 events, seek to 4', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(6 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #77: n=7 events, seek to 0', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(7 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #78: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #79: n=9 events, seek to 7', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(7);
    expect(replay.position()).toBe(7);
    expect(replay.remaining()).toBe(9 - 7);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #80: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #81: n=3 events, seek to 0', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(3 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #82: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #83: n=5 events, seek to 3', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(3);
    expect(replay.position()).toBe(3);
    expect(replay.remaining()).toBe(5 - 3);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #84: n=6 events, seek to 0', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(6 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #85: n=7 events, seek to 1', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(1);
    expect(replay.position()).toBe(1);
    expect(replay.remaining()).toBe(7 - 1);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #86: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #87: n=9 events, seek to 6', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(9 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #88: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #89: n=3 events, seek to 2', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(3 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #90: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #91: n=5 events, seek to 1', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(1);
    expect(replay.position()).toBe(1);
    expect(replay.remaining()).toBe(5 - 1);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #92: n=6 events, seek to 2', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(6 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #93: n=7 events, seek to 2', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(7 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #94: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #95: n=9 events, seek to 5', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(5);
    expect(replay.position()).toBe(5);
    expect(replay.remaining()).toBe(9 - 5);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #96: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #97: n=3 events, seek to 1', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(1);
    expect(replay.position()).toBe(1);
    expect(replay.remaining()).toBe(3 - 1);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #98: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #99: n=5 events, seek to 4', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(5 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #100: n=6 events, seek to 4', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(6 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #101: n=7 events, seek to 3', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(3);
    expect(replay.position()).toBe(3);
    expect(replay.remaining()).toBe(7 - 3);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #102: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #103: n=9 events, seek to 4', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(9 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #104: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #105: n=3 events, seek to 0', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(3 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #106: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #107: n=5 events, seek to 2', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(5 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #108: n=6 events, seek to 0', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(6 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #109: n=7 events, seek to 4', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(7 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #110: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #111: n=9 events, seek to 3', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(3);
    expect(replay.position()).toBe(3);
    expect(replay.remaining()).toBe(9 - 3);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #112: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #113: n=3 events, seek to 2', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(3 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #114: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #115: n=5 events, seek to 0', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(5 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #116: n=6 events, seek to 2', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(6 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #117: n=7 events, seek to 5', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(5);
    expect(replay.position()).toBe(5);
    expect(replay.remaining()).toBe(7 - 5);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #118: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #119: n=9 events, seek to 2', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(9 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #120: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #121: n=3 events, seek to 1', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(1);
    expect(replay.position()).toBe(1);
    expect(replay.remaining()).toBe(3 - 1);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #122: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #123: n=5 events, seek to 3', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(3);
    expect(replay.position()).toBe(3);
    expect(replay.remaining()).toBe(5 - 3);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #124: n=6 events, seek to 4', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(6 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #125: n=7 events, seek to 6', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(7 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #126: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #127: n=9 events, seek to 1', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(1);
    expect(replay.position()).toBe(1);
    expect(replay.remaining()).toBe(9 - 1);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #128: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #129: n=3 events, seek to 0', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(3 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #130: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #131: n=5 events, seek to 1', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(1);
    expect(replay.position()).toBe(1);
    expect(replay.remaining()).toBe(5 - 1);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #132: n=6 events, seek to 0', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(6 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #133: n=7 events, seek to 0', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(7 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #134: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #135: n=9 events, seek to 0', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(9 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #136: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #137: n=3 events, seek to 2', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(3 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #138: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #139: n=5 events, seek to 4', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(5 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #140: n=6 events, seek to 2', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(6 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #141: n=7 events, seek to 1', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(1);
    expect(replay.position()).toBe(1);
    expect(replay.remaining()).toBe(7 - 1);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #142: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #143: n=9 events, seek to 8', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(8);
    expect(replay.position()).toBe(8);
    expect(replay.remaining()).toBe(9 - 8);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #144: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #145: n=3 events, seek to 1', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(1);
    expect(replay.position()).toBe(1);
    expect(replay.remaining()).toBe(3 - 1);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #146: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #147: n=5 events, seek to 2', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(5 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #148: n=6 events, seek to 4', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(6 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #149: n=7 events, seek to 2', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(7 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #150: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #151: n=9 events, seek to 7', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(7);
    expect(replay.position()).toBe(7);
    expect(replay.remaining()).toBe(9 - 7);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #152: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #153: n=3 events, seek to 0', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(3 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #154: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #155: n=5 events, seek to 0', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(5 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #156: n=6 events, seek to 0', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(6 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #157: n=7 events, seek to 3', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(3);
    expect(replay.position()).toBe(3);
    expect(replay.remaining()).toBe(7 - 3);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #158: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #159: n=9 events, seek to 6', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(9 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #160: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #161: n=3 events, seek to 2', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(3 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #162: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #163: n=5 events, seek to 3', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(3);
    expect(replay.position()).toBe(3);
    expect(replay.remaining()).toBe(5 - 3);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #164: n=6 events, seek to 2', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(6 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #165: n=7 events, seek to 4', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(7 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #166: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #167: n=9 events, seek to 5', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(5);
    expect(replay.position()).toBe(5);
    expect(replay.remaining()).toBe(9 - 5);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #168: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #169: n=3 events, seek to 1', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(1);
    expect(replay.position()).toBe(1);
    expect(replay.remaining()).toBe(3 - 1);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #170: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #171: n=5 events, seek to 1', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(1);
    expect(replay.position()).toBe(1);
    expect(replay.remaining()).toBe(5 - 1);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #172: n=6 events, seek to 4', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(6 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #173: n=7 events, seek to 5', () => {
    const log = buildLogN(7);
    const replay = createReplay(log);
    expect(replay.total()).toBe(7);
    replay.seek(5);
    expect(replay.position()).toBe(5);
    expect(replay.remaining()).toBe(7 - 5);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #174: n=8 events, seek to 6', () => {
    const log = buildLogN(8);
    const replay = createReplay(log);
    expect(replay.total()).toBe(8);
    replay.seek(6);
    expect(replay.position()).toBe(6);
    expect(replay.remaining()).toBe(8 - 6);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #175: n=9 events, seek to 4', () => {
    const log = buildLogN(9);
    const replay = createReplay(log);
    expect(replay.total()).toBe(9);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(9 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #176: n=2 events, seek to 0', () => {
    const log = buildLogN(2);
    const replay = createReplay(log);
    expect(replay.total()).toBe(2);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(2 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #177: n=3 events, seek to 0', () => {
    const log = buildLogN(3);
    const replay = createReplay(log);
    expect(replay.total()).toBe(3);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(3 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #178: n=4 events, seek to 2', () => {
    const log = buildLogN(4);
    const replay = createReplay(log);
    expect(replay.total()).toBe(4);
    replay.seek(2);
    expect(replay.position()).toBe(2);
    expect(replay.remaining()).toBe(4 - 2);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #179: n=5 events, seek to 4', () => {
    const log = buildLogN(5);
    const replay = createReplay(log);
    expect(replay.total()).toBe(5);
    replay.seek(4);
    expect(replay.position()).toBe(4);
    expect(replay.remaining()).toBe(5 - 4);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
  it('replay test #180: n=6 events, seek to 0', () => {
    const log = buildLogN(6);
    const replay = createReplay(log);
    expect(replay.total()).toBe(6);
    replay.seek(0);
    expect(replay.position()).toBe(0);
    expect(replay.remaining()).toBe(6 - 0);
    replay.reset();
    expect(replay.position()).toBe(0);
    expect(replay.hasNext()).toBe(true);
  });
});

// ─── Section 5: aggregate / groupByType / groupByTimeBucket (100 tests) ───
describe('aggregate / groupByType / groupByTimeBucket', () => {
  function makeEvent(type: string, ts: number, payload: unknown = null): RecordedEvent {
    return { id: `e-${ts}`, timestamp: ts, type, payload };
  }

  it('aggregate returns empty object for empty array', () => {
    expect(aggregate([])).toEqual({});
  });
  it('aggregate counts single event', () => {
    const ev = makeEvent('click', 1000000);
    expect(aggregate([ev])).toEqual({ click: 1 });
  });
  it('aggregate counts multiple events of same type', () => {
    const evs = [makeEvent('click', 1000000), makeEvent('click', 1001000)];
    expect(aggregate(evs)).toEqual({ click: 2 });
  });
  it('aggregate counts multiple types separately', () => {
    const evs = [makeEvent('click', 1000000), makeEvent('hover', 1001000), makeEvent('click', 1002000)];
    const result = aggregate(evs);
    expect(result.click).toBe(2);
    expect(result.hover).toBe(1);
  });
  it('groupByType returns empty object for empty array', () => {
    expect(groupByType([])).toEqual({});
  });
  it('groupByType groups events by type', () => {
    const evs = [makeEvent('click', 1000000), makeEvent('hover', 1001000), makeEvent('click', 1002000)];
    const groups = groupByType(evs);
    expect(groups['click'].length).toBe(2);
    expect(groups['hover'].length).toBe(1);
  });
  it('groupByType preserves event order within group', () => {
    const ev1 = makeEvent('click', 1000000);
    const ev2 = makeEvent('click', 1001000);
    const groups = groupByType([ev1, ev2]);
    expect(groups['click'][0]).toEqual(ev1);
    expect(groups['click'][1]).toEqual(ev2);
  });
  it('groupByTimeBucket groups events into correct buckets', () => {
    const ev1 = makeEvent('click', 1000000);
    const ev2 = makeEvent('click', 1000500);
    const ev3 = makeEvent('click', 1001000);
    const groups = groupByTimeBucket([ev1, ev2, ev3], 1000);
    expect(groups[1000000].length).toBe(2);
    expect(groups[1001000].length).toBe(1);
  });
  it('groupByTimeBucket returns empty object for empty array', () => {
    expect(groupByTimeBucket([], 1000)).toEqual({});
  });
  it('groupByTimeBucket with bucketMs=1 puts each event in own bucket', () => {
    const evs = [makeEvent('x', 1000000), makeEvent('x', 1000001)];
    const groups = groupByTimeBucket(evs, 1);
    expect(Object.keys(groups).length).toBe(2);
  });
  it('aggregate/group test #1: 2 events', () => {
    const evs = [makeEvent('type0', 1001000), makeEvent('type1', 1002000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #2: 3 events', () => {
    const evs = [makeEvent('type0', 1002000), makeEvent('type1', 1003000), makeEvent('type2', 1004000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #3: 4 events', () => {
    const evs = [makeEvent('type0', 1003000), makeEvent('type1', 1004000), makeEvent('type2', 1005000), makeEvent('type0', 1006000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #4: 1 events', () => {
    const evs = [makeEvent('type0', 1004000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #5: 2 events', () => {
    const evs = [makeEvent('type0', 1005000), makeEvent('type1', 1006000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #6: 3 events', () => {
    const evs = [makeEvent('type0', 1006000), makeEvent('type1', 1007000), makeEvent('type2', 1008000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #7: 4 events', () => {
    const evs = [makeEvent('type0', 1007000), makeEvent('type1', 1008000), makeEvent('type2', 1009000), makeEvent('type0', 1010000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #8: 1 events', () => {
    const evs = [makeEvent('type0', 1008000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #9: 2 events', () => {
    const evs = [makeEvent('type0', 1009000), makeEvent('type1', 1010000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #10: 3 events', () => {
    const evs = [makeEvent('type0', 1010000), makeEvent('type1', 1011000), makeEvent('type2', 1012000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #11: 4 events', () => {
    const evs = [makeEvent('type0', 1011000), makeEvent('type1', 1012000), makeEvent('type2', 1013000), makeEvent('type0', 1014000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #12: 1 events', () => {
    const evs = [makeEvent('type0', 1012000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #13: 2 events', () => {
    const evs = [makeEvent('type0', 1013000), makeEvent('type1', 1014000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #14: 3 events', () => {
    const evs = [makeEvent('type0', 1014000), makeEvent('type1', 1015000), makeEvent('type2', 1016000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #15: 4 events', () => {
    const evs = [makeEvent('type0', 1015000), makeEvent('type1', 1016000), makeEvent('type2', 1017000), makeEvent('type0', 1018000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #16: 1 events', () => {
    const evs = [makeEvent('type0', 1016000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #17: 2 events', () => {
    const evs = [makeEvent('type0', 1017000), makeEvent('type1', 1018000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #18: 3 events', () => {
    const evs = [makeEvent('type0', 1018000), makeEvent('type1', 1019000), makeEvent('type2', 1020000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #19: 4 events', () => {
    const evs = [makeEvent('type0', 1019000), makeEvent('type1', 1020000), makeEvent('type2', 1021000), makeEvent('type0', 1022000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #20: 1 events', () => {
    const evs = [makeEvent('type0', 1020000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #21: 2 events', () => {
    const evs = [makeEvent('type0', 1021000), makeEvent('type1', 1022000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #22: 3 events', () => {
    const evs = [makeEvent('type0', 1022000), makeEvent('type1', 1023000), makeEvent('type2', 1024000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #23: 4 events', () => {
    const evs = [makeEvent('type0', 1023000), makeEvent('type1', 1024000), makeEvent('type2', 1025000), makeEvent('type0', 1026000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #24: 1 events', () => {
    const evs = [makeEvent('type0', 1024000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #25: 2 events', () => {
    const evs = [makeEvent('type0', 1025000), makeEvent('type1', 1026000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #26: 3 events', () => {
    const evs = [makeEvent('type0', 1026000), makeEvent('type1', 1027000), makeEvent('type2', 1028000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #27: 4 events', () => {
    const evs = [makeEvent('type0', 1027000), makeEvent('type1', 1028000), makeEvent('type2', 1029000), makeEvent('type0', 1030000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #28: 1 events', () => {
    const evs = [makeEvent('type0', 1028000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #29: 2 events', () => {
    const evs = [makeEvent('type0', 1029000), makeEvent('type1', 1030000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #30: 3 events', () => {
    const evs = [makeEvent('type0', 1030000), makeEvent('type1', 1031000), makeEvent('type2', 1032000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #31: 4 events', () => {
    const evs = [makeEvent('type0', 1031000), makeEvent('type1', 1032000), makeEvent('type2', 1033000), makeEvent('type0', 1034000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #32: 1 events', () => {
    const evs = [makeEvent('type0', 1032000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #33: 2 events', () => {
    const evs = [makeEvent('type0', 1033000), makeEvent('type1', 1034000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #34: 3 events', () => {
    const evs = [makeEvent('type0', 1034000), makeEvent('type1', 1035000), makeEvent('type2', 1036000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #35: 4 events', () => {
    const evs = [makeEvent('type0', 1035000), makeEvent('type1', 1036000), makeEvent('type2', 1037000), makeEvent('type0', 1038000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #36: 1 events', () => {
    const evs = [makeEvent('type0', 1036000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #37: 2 events', () => {
    const evs = [makeEvent('type0', 1037000), makeEvent('type1', 1038000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #38: 3 events', () => {
    const evs = [makeEvent('type0', 1038000), makeEvent('type1', 1039000), makeEvent('type2', 1040000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #39: 4 events', () => {
    const evs = [makeEvent('type0', 1039000), makeEvent('type1', 1040000), makeEvent('type2', 1041000), makeEvent('type0', 1042000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #40: 1 events', () => {
    const evs = [makeEvent('type0', 1040000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #41: 2 events', () => {
    const evs = [makeEvent('type0', 1041000), makeEvent('type1', 1042000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #42: 3 events', () => {
    const evs = [makeEvent('type0', 1042000), makeEvent('type1', 1043000), makeEvent('type2', 1044000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #43: 4 events', () => {
    const evs = [makeEvent('type0', 1043000), makeEvent('type1', 1044000), makeEvent('type2', 1045000), makeEvent('type0', 1046000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #44: 1 events', () => {
    const evs = [makeEvent('type0', 1044000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #45: 2 events', () => {
    const evs = [makeEvent('type0', 1045000), makeEvent('type1', 1046000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #46: 3 events', () => {
    const evs = [makeEvent('type0', 1046000), makeEvent('type1', 1047000), makeEvent('type2', 1048000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #47: 4 events', () => {
    const evs = [makeEvent('type0', 1047000), makeEvent('type1', 1048000), makeEvent('type2', 1049000), makeEvent('type0', 1050000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #48: 1 events', () => {
    const evs = [makeEvent('type0', 1048000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #49: 2 events', () => {
    const evs = [makeEvent('type0', 1049000), makeEvent('type1', 1050000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #50: 3 events', () => {
    const evs = [makeEvent('type0', 1050000), makeEvent('type1', 1051000), makeEvent('type2', 1052000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #51: 4 events', () => {
    const evs = [makeEvent('type0', 1051000), makeEvent('type1', 1052000), makeEvent('type2', 1053000), makeEvent('type0', 1054000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #52: 1 events', () => {
    const evs = [makeEvent('type0', 1052000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #53: 2 events', () => {
    const evs = [makeEvent('type0', 1053000), makeEvent('type1', 1054000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #54: 3 events', () => {
    const evs = [makeEvent('type0', 1054000), makeEvent('type1', 1055000), makeEvent('type2', 1056000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #55: 4 events', () => {
    const evs = [makeEvent('type0', 1055000), makeEvent('type1', 1056000), makeEvent('type2', 1057000), makeEvent('type0', 1058000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #56: 1 events', () => {
    const evs = [makeEvent('type0', 1056000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #57: 2 events', () => {
    const evs = [makeEvent('type0', 1057000), makeEvent('type1', 1058000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #58: 3 events', () => {
    const evs = [makeEvent('type0', 1058000), makeEvent('type1', 1059000), makeEvent('type2', 1060000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #59: 4 events', () => {
    const evs = [makeEvent('type0', 1059000), makeEvent('type1', 1060000), makeEvent('type2', 1061000), makeEvent('type0', 1062000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #60: 1 events', () => {
    const evs = [makeEvent('type0', 1060000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #61: 2 events', () => {
    const evs = [makeEvent('type0', 1061000), makeEvent('type1', 1062000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #62: 3 events', () => {
    const evs = [makeEvent('type0', 1062000), makeEvent('type1', 1063000), makeEvent('type2', 1064000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #63: 4 events', () => {
    const evs = [makeEvent('type0', 1063000), makeEvent('type1', 1064000), makeEvent('type2', 1065000), makeEvent('type0', 1066000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #64: 1 events', () => {
    const evs = [makeEvent('type0', 1064000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #65: 2 events', () => {
    const evs = [makeEvent('type0', 1065000), makeEvent('type1', 1066000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #66: 3 events', () => {
    const evs = [makeEvent('type0', 1066000), makeEvent('type1', 1067000), makeEvent('type2', 1068000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #67: 4 events', () => {
    const evs = [makeEvent('type0', 1067000), makeEvent('type1', 1068000), makeEvent('type2', 1069000), makeEvent('type0', 1070000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #68: 1 events', () => {
    const evs = [makeEvent('type0', 1068000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #69: 2 events', () => {
    const evs = [makeEvent('type0', 1069000), makeEvent('type1', 1070000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #70: 3 events', () => {
    const evs = [makeEvent('type0', 1070000), makeEvent('type1', 1071000), makeEvent('type2', 1072000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #71: 4 events', () => {
    const evs = [makeEvent('type0', 1071000), makeEvent('type1', 1072000), makeEvent('type2', 1073000), makeEvent('type0', 1074000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #72: 1 events', () => {
    const evs = [makeEvent('type0', 1072000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #73: 2 events', () => {
    const evs = [makeEvent('type0', 1073000), makeEvent('type1', 1074000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #74: 3 events', () => {
    const evs = [makeEvent('type0', 1074000), makeEvent('type1', 1075000), makeEvent('type2', 1076000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #75: 4 events', () => {
    const evs = [makeEvent('type0', 1075000), makeEvent('type1', 1076000), makeEvent('type2', 1077000), makeEvent('type0', 1078000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #76: 1 events', () => {
    const evs = [makeEvent('type0', 1076000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #77: 2 events', () => {
    const evs = [makeEvent('type0', 1077000), makeEvent('type1', 1078000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #78: 3 events', () => {
    const evs = [makeEvent('type0', 1078000), makeEvent('type1', 1079000), makeEvent('type2', 1080000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #79: 4 events', () => {
    const evs = [makeEvent('type0', 1079000), makeEvent('type1', 1080000), makeEvent('type2', 1081000), makeEvent('type0', 1082000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #80: 1 events', () => {
    const evs = [makeEvent('type0', 1080000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #81: 2 events', () => {
    const evs = [makeEvent('type0', 1081000), makeEvent('type1', 1082000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #82: 3 events', () => {
    const evs = [makeEvent('type0', 1082000), makeEvent('type1', 1083000), makeEvent('type2', 1084000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #83: 4 events', () => {
    const evs = [makeEvent('type0', 1083000), makeEvent('type1', 1084000), makeEvent('type2', 1085000), makeEvent('type0', 1086000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #84: 1 events', () => {
    const evs = [makeEvent('type0', 1084000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #85: 2 events', () => {
    const evs = [makeEvent('type0', 1085000), makeEvent('type1', 1086000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #86: 3 events', () => {
    const evs = [makeEvent('type0', 1086000), makeEvent('type1', 1087000), makeEvent('type2', 1088000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #87: 4 events', () => {
    const evs = [makeEvent('type0', 1087000), makeEvent('type1', 1088000), makeEvent('type2', 1089000), makeEvent('type0', 1090000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(2);
    expect(groups['type0'].length).toBe(2);
  });
  it('aggregate/group test #88: 1 events', () => {
    const evs = [makeEvent('type0', 1088000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #89: 2 events', () => {
    const evs = [makeEvent('type0', 1089000), makeEvent('type1', 1090000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
  it('aggregate/group test #90: 3 events', () => {
    const evs = [makeEvent('type0', 1090000), makeEvent('type1', 1091000), makeEvent('type2', 1092000)];
    const agg = aggregate(evs);
    const groups = groupByType(evs);
    expect(agg['type0']).toBe(1);
    expect(groups['type0'].length).toBe(1);
  });
});

// ─── Section 6: filterByTypes / filterByTimeRange (100 tests) ───
describe('filterByTypes / filterByTimeRange', () => {
  function makeEvent(type: string, ts: number): RecordedEvent {
    return { id: `e-${ts}`, timestamp: ts, type, payload: null };
  }

  it('filterByTypes returns empty for empty array', () => {
    expect(filterByTypes([], ['click'])).toEqual([]);
  });
  it('filterByTypes returns empty when types array is empty', () => {
    const ev = makeEvent('click', 1000000);
    expect(filterByTypes([ev], [])).toEqual([]);
  });
  it('filterByTypes returns matching events', () => {
    const evs = [makeEvent('click', 1000000), makeEvent('hover', 1001000)];
    const result = filterByTypes(evs, ['click']);
    expect(result.length).toBe(1);
    expect(result[0].type).toBe('click');
  });
  it('filterByTypes filters multiple types', () => {
    const evs = [makeEvent('click', 1000000), makeEvent('hover', 1001000), makeEvent('scroll', 1002000)];
    const result = filterByTypes(evs, ['click', 'hover']);
    expect(result.length).toBe(2);
  });
  it('filterByTypes excludes non-matching types', () => {
    const evs = [makeEvent('click', 1000000), makeEvent('scroll', 1001000)];
    const result = filterByTypes(evs, ['hover']);
    expect(result).toEqual([]);
  });
  it('filterByTimeRange returns empty for empty array', () => {
    expect(filterByTimeRange([], 1000000, 2000000)).toEqual([]);
  });
  it('filterByTimeRange includes events at boundaries', () => {
    const ev1 = makeEvent('x', 1000000);
    const ev2 = makeEvent('x', 2000000);
    const result = filterByTimeRange([ev1, ev2], 1000000, 2000000);
    expect(result.length).toBe(2);
  });
  it('filterByTimeRange excludes events outside range', () => {
    const evs = [makeEvent('x', 999999), makeEvent('x', 1000000), makeEvent('x', 2000001)];
    const result = filterByTimeRange(evs, 1000000, 2000000);
    expect(result.length).toBe(1);
  });
  it('filterByTimeRange with equal from and to returns events at that time', () => {
    const ev = makeEvent('x', 1000000);
    const result = filterByTimeRange([ev], 1000000, 1000000);
    expect(result.length).toBe(1);
  });
  it('filterByTimeRange with inverted range returns empty', () => {
    const ev = makeEvent('x', 1000000);
    const result = filterByTimeRange([ev], 2000000, 1000000);
    expect(result).toEqual([]);
  });
  it('filter test #1: 3 events, range [1011000,1011000]', () => {
    const evs = [makeEvent('type0', 1010000), makeEvent('type1', 1011000), makeEvent('type2', 1012000)];
    const ranged = filterByTimeRange(evs, 1011000, 1011000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #2: 4 events, range [1021000,1022000]', () => {
    const evs = [makeEvent('type0', 1020000), makeEvent('type1', 1021000), makeEvent('type2', 1022000), makeEvent('type0', 1023000)];
    const ranged = filterByTimeRange(evs, 1021000, 1022000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #3: 5 events, range [1031000,1033000]', () => {
    const evs = [makeEvent('type0', 1030000), makeEvent('type1', 1031000), makeEvent('type2', 1032000), makeEvent('type0', 1033000), makeEvent('type1', 1034000)];
    const ranged = filterByTimeRange(evs, 1031000, 1033000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #4: 2 events, range [1041000,1041000]', () => {
    const evs = [makeEvent('type0', 1040000), makeEvent('type1', 1041000)];
    const ranged = filterByTimeRange(evs, 1041000, 1041000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #5: 3 events, range [1051000,1051000]', () => {
    const evs = [makeEvent('type0', 1050000), makeEvent('type1', 1051000), makeEvent('type2', 1052000)];
    const ranged = filterByTimeRange(evs, 1051000, 1051000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #6: 4 events, range [1061000,1062000]', () => {
    const evs = [makeEvent('type0', 1060000), makeEvent('type1', 1061000), makeEvent('type2', 1062000), makeEvent('type0', 1063000)];
    const ranged = filterByTimeRange(evs, 1061000, 1062000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #7: 5 events, range [1071000,1073000]', () => {
    const evs = [makeEvent('type0', 1070000), makeEvent('type1', 1071000), makeEvent('type2', 1072000), makeEvent('type0', 1073000), makeEvent('type1', 1074000)];
    const ranged = filterByTimeRange(evs, 1071000, 1073000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #8: 2 events, range [1081000,1081000]', () => {
    const evs = [makeEvent('type0', 1080000), makeEvent('type1', 1081000)];
    const ranged = filterByTimeRange(evs, 1081000, 1081000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #9: 3 events, range [1091000,1091000]', () => {
    const evs = [makeEvent('type0', 1090000), makeEvent('type1', 1091000), makeEvent('type2', 1092000)];
    const ranged = filterByTimeRange(evs, 1091000, 1091000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #10: 4 events, range [1101000,1102000]', () => {
    const evs = [makeEvent('type0', 1100000), makeEvent('type1', 1101000), makeEvent('type2', 1102000), makeEvent('type0', 1103000)];
    const ranged = filterByTimeRange(evs, 1101000, 1102000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #11: 5 events, range [1111000,1113000]', () => {
    const evs = [makeEvent('type0', 1110000), makeEvent('type1', 1111000), makeEvent('type2', 1112000), makeEvent('type0', 1113000), makeEvent('type1', 1114000)];
    const ranged = filterByTimeRange(evs, 1111000, 1113000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #12: 2 events, range [1121000,1121000]', () => {
    const evs = [makeEvent('type0', 1120000), makeEvent('type1', 1121000)];
    const ranged = filterByTimeRange(evs, 1121000, 1121000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #13: 3 events, range [1131000,1131000]', () => {
    const evs = [makeEvent('type0', 1130000), makeEvent('type1', 1131000), makeEvent('type2', 1132000)];
    const ranged = filterByTimeRange(evs, 1131000, 1131000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #14: 4 events, range [1141000,1142000]', () => {
    const evs = [makeEvent('type0', 1140000), makeEvent('type1', 1141000), makeEvent('type2', 1142000), makeEvent('type0', 1143000)];
    const ranged = filterByTimeRange(evs, 1141000, 1142000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #15: 5 events, range [1151000,1153000]', () => {
    const evs = [makeEvent('type0', 1150000), makeEvent('type1', 1151000), makeEvent('type2', 1152000), makeEvent('type0', 1153000), makeEvent('type1', 1154000)];
    const ranged = filterByTimeRange(evs, 1151000, 1153000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #16: 2 events, range [1161000,1161000]', () => {
    const evs = [makeEvent('type0', 1160000), makeEvent('type1', 1161000)];
    const ranged = filterByTimeRange(evs, 1161000, 1161000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #17: 3 events, range [1171000,1171000]', () => {
    const evs = [makeEvent('type0', 1170000), makeEvent('type1', 1171000), makeEvent('type2', 1172000)];
    const ranged = filterByTimeRange(evs, 1171000, 1171000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #18: 4 events, range [1181000,1182000]', () => {
    const evs = [makeEvent('type0', 1180000), makeEvent('type1', 1181000), makeEvent('type2', 1182000), makeEvent('type0', 1183000)];
    const ranged = filterByTimeRange(evs, 1181000, 1182000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #19: 5 events, range [1191000,1193000]', () => {
    const evs = [makeEvent('type0', 1190000), makeEvent('type1', 1191000), makeEvent('type2', 1192000), makeEvent('type0', 1193000), makeEvent('type1', 1194000)];
    const ranged = filterByTimeRange(evs, 1191000, 1193000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #20: 2 events, range [1201000,1201000]', () => {
    const evs = [makeEvent('type0', 1200000), makeEvent('type1', 1201000)];
    const ranged = filterByTimeRange(evs, 1201000, 1201000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #21: 3 events, range [1211000,1211000]', () => {
    const evs = [makeEvent('type0', 1210000), makeEvent('type1', 1211000), makeEvent('type2', 1212000)];
    const ranged = filterByTimeRange(evs, 1211000, 1211000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #22: 4 events, range [1221000,1222000]', () => {
    const evs = [makeEvent('type0', 1220000), makeEvent('type1', 1221000), makeEvent('type2', 1222000), makeEvent('type0', 1223000)];
    const ranged = filterByTimeRange(evs, 1221000, 1222000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #23: 5 events, range [1231000,1233000]', () => {
    const evs = [makeEvent('type0', 1230000), makeEvent('type1', 1231000), makeEvent('type2', 1232000), makeEvent('type0', 1233000), makeEvent('type1', 1234000)];
    const ranged = filterByTimeRange(evs, 1231000, 1233000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #24: 2 events, range [1241000,1241000]', () => {
    const evs = [makeEvent('type0', 1240000), makeEvent('type1', 1241000)];
    const ranged = filterByTimeRange(evs, 1241000, 1241000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #25: 3 events, range [1251000,1251000]', () => {
    const evs = [makeEvent('type0', 1250000), makeEvent('type1', 1251000), makeEvent('type2', 1252000)];
    const ranged = filterByTimeRange(evs, 1251000, 1251000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #26: 4 events, range [1261000,1262000]', () => {
    const evs = [makeEvent('type0', 1260000), makeEvent('type1', 1261000), makeEvent('type2', 1262000), makeEvent('type0', 1263000)];
    const ranged = filterByTimeRange(evs, 1261000, 1262000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #27: 5 events, range [1271000,1273000]', () => {
    const evs = [makeEvent('type0', 1270000), makeEvent('type1', 1271000), makeEvent('type2', 1272000), makeEvent('type0', 1273000), makeEvent('type1', 1274000)];
    const ranged = filterByTimeRange(evs, 1271000, 1273000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #28: 2 events, range [1281000,1281000]', () => {
    const evs = [makeEvent('type0', 1280000), makeEvent('type1', 1281000)];
    const ranged = filterByTimeRange(evs, 1281000, 1281000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #29: 3 events, range [1291000,1291000]', () => {
    const evs = [makeEvent('type0', 1290000), makeEvent('type1', 1291000), makeEvent('type2', 1292000)];
    const ranged = filterByTimeRange(evs, 1291000, 1291000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #30: 4 events, range [1301000,1302000]', () => {
    const evs = [makeEvent('type0', 1300000), makeEvent('type1', 1301000), makeEvent('type2', 1302000), makeEvent('type0', 1303000)];
    const ranged = filterByTimeRange(evs, 1301000, 1302000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #31: 5 events, range [1311000,1313000]', () => {
    const evs = [makeEvent('type0', 1310000), makeEvent('type1', 1311000), makeEvent('type2', 1312000), makeEvent('type0', 1313000), makeEvent('type1', 1314000)];
    const ranged = filterByTimeRange(evs, 1311000, 1313000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #32: 2 events, range [1321000,1321000]', () => {
    const evs = [makeEvent('type0', 1320000), makeEvent('type1', 1321000)];
    const ranged = filterByTimeRange(evs, 1321000, 1321000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #33: 3 events, range [1331000,1331000]', () => {
    const evs = [makeEvent('type0', 1330000), makeEvent('type1', 1331000), makeEvent('type2', 1332000)];
    const ranged = filterByTimeRange(evs, 1331000, 1331000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #34: 4 events, range [1341000,1342000]', () => {
    const evs = [makeEvent('type0', 1340000), makeEvent('type1', 1341000), makeEvent('type2', 1342000), makeEvent('type0', 1343000)];
    const ranged = filterByTimeRange(evs, 1341000, 1342000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #35: 5 events, range [1351000,1353000]', () => {
    const evs = [makeEvent('type0', 1350000), makeEvent('type1', 1351000), makeEvent('type2', 1352000), makeEvent('type0', 1353000), makeEvent('type1', 1354000)];
    const ranged = filterByTimeRange(evs, 1351000, 1353000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #36: 2 events, range [1361000,1361000]', () => {
    const evs = [makeEvent('type0', 1360000), makeEvent('type1', 1361000)];
    const ranged = filterByTimeRange(evs, 1361000, 1361000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #37: 3 events, range [1371000,1371000]', () => {
    const evs = [makeEvent('type0', 1370000), makeEvent('type1', 1371000), makeEvent('type2', 1372000)];
    const ranged = filterByTimeRange(evs, 1371000, 1371000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #38: 4 events, range [1381000,1382000]', () => {
    const evs = [makeEvent('type0', 1380000), makeEvent('type1', 1381000), makeEvent('type2', 1382000), makeEvent('type0', 1383000)];
    const ranged = filterByTimeRange(evs, 1381000, 1382000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #39: 5 events, range [1391000,1393000]', () => {
    const evs = [makeEvent('type0', 1390000), makeEvent('type1', 1391000), makeEvent('type2', 1392000), makeEvent('type0', 1393000), makeEvent('type1', 1394000)];
    const ranged = filterByTimeRange(evs, 1391000, 1393000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #40: 2 events, range [1401000,1401000]', () => {
    const evs = [makeEvent('type0', 1400000), makeEvent('type1', 1401000)];
    const ranged = filterByTimeRange(evs, 1401000, 1401000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #41: 3 events, range [1411000,1411000]', () => {
    const evs = [makeEvent('type0', 1410000), makeEvent('type1', 1411000), makeEvent('type2', 1412000)];
    const ranged = filterByTimeRange(evs, 1411000, 1411000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #42: 4 events, range [1421000,1422000]', () => {
    const evs = [makeEvent('type0', 1420000), makeEvent('type1', 1421000), makeEvent('type2', 1422000), makeEvent('type0', 1423000)];
    const ranged = filterByTimeRange(evs, 1421000, 1422000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #43: 5 events, range [1431000,1433000]', () => {
    const evs = [makeEvent('type0', 1430000), makeEvent('type1', 1431000), makeEvent('type2', 1432000), makeEvent('type0', 1433000), makeEvent('type1', 1434000)];
    const ranged = filterByTimeRange(evs, 1431000, 1433000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #44: 2 events, range [1441000,1441000]', () => {
    const evs = [makeEvent('type0', 1440000), makeEvent('type1', 1441000)];
    const ranged = filterByTimeRange(evs, 1441000, 1441000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #45: 3 events, range [1451000,1451000]', () => {
    const evs = [makeEvent('type0', 1450000), makeEvent('type1', 1451000), makeEvent('type2', 1452000)];
    const ranged = filterByTimeRange(evs, 1451000, 1451000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #46: 4 events, range [1461000,1462000]', () => {
    const evs = [makeEvent('type0', 1460000), makeEvent('type1', 1461000), makeEvent('type2', 1462000), makeEvent('type0', 1463000)];
    const ranged = filterByTimeRange(evs, 1461000, 1462000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #47: 5 events, range [1471000,1473000]', () => {
    const evs = [makeEvent('type0', 1470000), makeEvent('type1', 1471000), makeEvent('type2', 1472000), makeEvent('type0', 1473000), makeEvent('type1', 1474000)];
    const ranged = filterByTimeRange(evs, 1471000, 1473000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #48: 2 events, range [1481000,1481000]', () => {
    const evs = [makeEvent('type0', 1480000), makeEvent('type1', 1481000)];
    const ranged = filterByTimeRange(evs, 1481000, 1481000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #49: 3 events, range [1491000,1491000]', () => {
    const evs = [makeEvent('type0', 1490000), makeEvent('type1', 1491000), makeEvent('type2', 1492000)];
    const ranged = filterByTimeRange(evs, 1491000, 1491000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #50: 4 events, range [1501000,1502000]', () => {
    const evs = [makeEvent('type0', 1500000), makeEvent('type1', 1501000), makeEvent('type2', 1502000), makeEvent('type0', 1503000)];
    const ranged = filterByTimeRange(evs, 1501000, 1502000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #51: 5 events, range [1511000,1513000]', () => {
    const evs = [makeEvent('type0', 1510000), makeEvent('type1', 1511000), makeEvent('type2', 1512000), makeEvent('type0', 1513000), makeEvent('type1', 1514000)];
    const ranged = filterByTimeRange(evs, 1511000, 1513000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #52: 2 events, range [1521000,1521000]', () => {
    const evs = [makeEvent('type0', 1520000), makeEvent('type1', 1521000)];
    const ranged = filterByTimeRange(evs, 1521000, 1521000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #53: 3 events, range [1531000,1531000]', () => {
    const evs = [makeEvent('type0', 1530000), makeEvent('type1', 1531000), makeEvent('type2', 1532000)];
    const ranged = filterByTimeRange(evs, 1531000, 1531000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #54: 4 events, range [1541000,1542000]', () => {
    const evs = [makeEvent('type0', 1540000), makeEvent('type1', 1541000), makeEvent('type2', 1542000), makeEvent('type0', 1543000)];
    const ranged = filterByTimeRange(evs, 1541000, 1542000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #55: 5 events, range [1551000,1553000]', () => {
    const evs = [makeEvent('type0', 1550000), makeEvent('type1', 1551000), makeEvent('type2', 1552000), makeEvent('type0', 1553000), makeEvent('type1', 1554000)];
    const ranged = filterByTimeRange(evs, 1551000, 1553000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #56: 2 events, range [1561000,1561000]', () => {
    const evs = [makeEvent('type0', 1560000), makeEvent('type1', 1561000)];
    const ranged = filterByTimeRange(evs, 1561000, 1561000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #57: 3 events, range [1571000,1571000]', () => {
    const evs = [makeEvent('type0', 1570000), makeEvent('type1', 1571000), makeEvent('type2', 1572000)];
    const ranged = filterByTimeRange(evs, 1571000, 1571000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #58: 4 events, range [1581000,1582000]', () => {
    const evs = [makeEvent('type0', 1580000), makeEvent('type1', 1581000), makeEvent('type2', 1582000), makeEvent('type0', 1583000)];
    const ranged = filterByTimeRange(evs, 1581000, 1582000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #59: 5 events, range [1591000,1593000]', () => {
    const evs = [makeEvent('type0', 1590000), makeEvent('type1', 1591000), makeEvent('type2', 1592000), makeEvent('type0', 1593000), makeEvent('type1', 1594000)];
    const ranged = filterByTimeRange(evs, 1591000, 1593000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #60: 2 events, range [1601000,1601000]', () => {
    const evs = [makeEvent('type0', 1600000), makeEvent('type1', 1601000)];
    const ranged = filterByTimeRange(evs, 1601000, 1601000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #61: 3 events, range [1611000,1611000]', () => {
    const evs = [makeEvent('type0', 1610000), makeEvent('type1', 1611000), makeEvent('type2', 1612000)];
    const ranged = filterByTimeRange(evs, 1611000, 1611000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #62: 4 events, range [1621000,1622000]', () => {
    const evs = [makeEvent('type0', 1620000), makeEvent('type1', 1621000), makeEvent('type2', 1622000), makeEvent('type0', 1623000)];
    const ranged = filterByTimeRange(evs, 1621000, 1622000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #63: 5 events, range [1631000,1633000]', () => {
    const evs = [makeEvent('type0', 1630000), makeEvent('type1', 1631000), makeEvent('type2', 1632000), makeEvent('type0', 1633000), makeEvent('type1', 1634000)];
    const ranged = filterByTimeRange(evs, 1631000, 1633000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #64: 2 events, range [1641000,1641000]', () => {
    const evs = [makeEvent('type0', 1640000), makeEvent('type1', 1641000)];
    const ranged = filterByTimeRange(evs, 1641000, 1641000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #65: 3 events, range [1651000,1651000]', () => {
    const evs = [makeEvent('type0', 1650000), makeEvent('type1', 1651000), makeEvent('type2', 1652000)];
    const ranged = filterByTimeRange(evs, 1651000, 1651000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #66: 4 events, range [1661000,1662000]', () => {
    const evs = [makeEvent('type0', 1660000), makeEvent('type1', 1661000), makeEvent('type2', 1662000), makeEvent('type0', 1663000)];
    const ranged = filterByTimeRange(evs, 1661000, 1662000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #67: 5 events, range [1671000,1673000]', () => {
    const evs = [makeEvent('type0', 1670000), makeEvent('type1', 1671000), makeEvent('type2', 1672000), makeEvent('type0', 1673000), makeEvent('type1', 1674000)];
    const ranged = filterByTimeRange(evs, 1671000, 1673000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #68: 2 events, range [1681000,1681000]', () => {
    const evs = [makeEvent('type0', 1680000), makeEvent('type1', 1681000)];
    const ranged = filterByTimeRange(evs, 1681000, 1681000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #69: 3 events, range [1691000,1691000]', () => {
    const evs = [makeEvent('type0', 1690000), makeEvent('type1', 1691000), makeEvent('type2', 1692000)];
    const ranged = filterByTimeRange(evs, 1691000, 1691000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #70: 4 events, range [1701000,1702000]', () => {
    const evs = [makeEvent('type0', 1700000), makeEvent('type1', 1701000), makeEvent('type2', 1702000), makeEvent('type0', 1703000)];
    const ranged = filterByTimeRange(evs, 1701000, 1702000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #71: 5 events, range [1711000,1713000]', () => {
    const evs = [makeEvent('type0', 1710000), makeEvent('type1', 1711000), makeEvent('type2', 1712000), makeEvent('type0', 1713000), makeEvent('type1', 1714000)];
    const ranged = filterByTimeRange(evs, 1711000, 1713000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #72: 2 events, range [1721000,1721000]', () => {
    const evs = [makeEvent('type0', 1720000), makeEvent('type1', 1721000)];
    const ranged = filterByTimeRange(evs, 1721000, 1721000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #73: 3 events, range [1731000,1731000]', () => {
    const evs = [makeEvent('type0', 1730000), makeEvent('type1', 1731000), makeEvent('type2', 1732000)];
    const ranged = filterByTimeRange(evs, 1731000, 1731000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #74: 4 events, range [1741000,1742000]', () => {
    const evs = [makeEvent('type0', 1740000), makeEvent('type1', 1741000), makeEvent('type2', 1742000), makeEvent('type0', 1743000)];
    const ranged = filterByTimeRange(evs, 1741000, 1742000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #75: 5 events, range [1751000,1753000]', () => {
    const evs = [makeEvent('type0', 1750000), makeEvent('type1', 1751000), makeEvent('type2', 1752000), makeEvent('type0', 1753000), makeEvent('type1', 1754000)];
    const ranged = filterByTimeRange(evs, 1751000, 1753000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #76: 2 events, range [1761000,1761000]', () => {
    const evs = [makeEvent('type0', 1760000), makeEvent('type1', 1761000)];
    const ranged = filterByTimeRange(evs, 1761000, 1761000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #77: 3 events, range [1771000,1771000]', () => {
    const evs = [makeEvent('type0', 1770000), makeEvent('type1', 1771000), makeEvent('type2', 1772000)];
    const ranged = filterByTimeRange(evs, 1771000, 1771000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #78: 4 events, range [1781000,1782000]', () => {
    const evs = [makeEvent('type0', 1780000), makeEvent('type1', 1781000), makeEvent('type2', 1782000), makeEvent('type0', 1783000)];
    const ranged = filterByTimeRange(evs, 1781000, 1782000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #79: 5 events, range [1791000,1793000]', () => {
    const evs = [makeEvent('type0', 1790000), makeEvent('type1', 1791000), makeEvent('type2', 1792000), makeEvent('type0', 1793000), makeEvent('type1', 1794000)];
    const ranged = filterByTimeRange(evs, 1791000, 1793000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #80: 2 events, range [1801000,1801000]', () => {
    const evs = [makeEvent('type0', 1800000), makeEvent('type1', 1801000)];
    const ranged = filterByTimeRange(evs, 1801000, 1801000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #81: 3 events, range [1811000,1811000]', () => {
    const evs = [makeEvent('type0', 1810000), makeEvent('type1', 1811000), makeEvent('type2', 1812000)];
    const ranged = filterByTimeRange(evs, 1811000, 1811000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #82: 4 events, range [1821000,1822000]', () => {
    const evs = [makeEvent('type0', 1820000), makeEvent('type1', 1821000), makeEvent('type2', 1822000), makeEvent('type0', 1823000)];
    const ranged = filterByTimeRange(evs, 1821000, 1822000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #83: 5 events, range [1831000,1833000]', () => {
    const evs = [makeEvent('type0', 1830000), makeEvent('type1', 1831000), makeEvent('type2', 1832000), makeEvent('type0', 1833000), makeEvent('type1', 1834000)];
    const ranged = filterByTimeRange(evs, 1831000, 1833000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #84: 2 events, range [1841000,1841000]', () => {
    const evs = [makeEvent('type0', 1840000), makeEvent('type1', 1841000)];
    const ranged = filterByTimeRange(evs, 1841000, 1841000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #85: 3 events, range [1851000,1851000]', () => {
    const evs = [makeEvent('type0', 1850000), makeEvent('type1', 1851000), makeEvent('type2', 1852000)];
    const ranged = filterByTimeRange(evs, 1851000, 1851000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #86: 4 events, range [1861000,1862000]', () => {
    const evs = [makeEvent('type0', 1860000), makeEvent('type1', 1861000), makeEvent('type2', 1862000), makeEvent('type0', 1863000)];
    const ranged = filterByTimeRange(evs, 1861000, 1862000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #87: 5 events, range [1871000,1873000]', () => {
    const evs = [makeEvent('type0', 1870000), makeEvent('type1', 1871000), makeEvent('type2', 1872000), makeEvent('type0', 1873000), makeEvent('type1', 1874000)];
    const ranged = filterByTimeRange(evs, 1871000, 1873000);
    expect(ranged.length).toBe(3);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
  it('filter test #88: 2 events, range [1881000,1881000]', () => {
    const evs = [makeEvent('type0', 1880000), makeEvent('type1', 1881000)];
    const ranged = filterByTimeRange(evs, 1881000, 1881000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #89: 3 events, range [1891000,1891000]', () => {
    const evs = [makeEvent('type0', 1890000), makeEvent('type1', 1891000), makeEvent('type2', 1892000)];
    const ranged = filterByTimeRange(evs, 1891000, 1891000);
    expect(ranged.length).toBe(1);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(1);
  });
  it('filter test #90: 4 events, range [1901000,1902000]', () => {
    const evs = [makeEvent('type0', 1900000), makeEvent('type1', 1901000), makeEvent('type2', 1902000), makeEvent('type0', 1903000)];
    const ranged = filterByTimeRange(evs, 1901000, 1902000);
    expect(ranged.length).toBe(2);
    const typed = filterByTypes(evs, ['type0']);
    expect(typed.length).toBe(2);
  });
});

// ─── Section 7: deduplicate (100 tests) ───
describe('deduplicate', () => {
  function makeEvent(type: string, ts: number): RecordedEvent {
    return { id: `d-${ts}-${type}`, timestamp: ts, type, payload: null };
  }

  it('returns empty array for empty input', () => {
    expect(deduplicate([])).toEqual([]);
  });
  it('returns single event unchanged', () => {
    const ev = makeEvent('click', 1000000);
    expect(deduplicate([ev])).toEqual([ev]);
  });
  it('keeps unique events (no window)', () => {
    const evs = [makeEvent('click', 1000000), makeEvent('hover', 1001000)];
    expect(deduplicate(evs).length).toBe(2);
  });
  it('deduplicates events with same type and timestamp (no window)', () => {
    const ev1 = makeEvent('click', 1000000);
    const ev2 = { ...makeEvent('click', 1000000), id: 'ev2' };
    const result = deduplicate([ev1, ev2]);
    expect(result.length).toBe(1);
  });
  it('keeps events with same type but different timestamps (no window)', () => {
    const evs = [makeEvent('click', 1000000), makeEvent('click', 1001000)];
    expect(deduplicate(evs).length).toBe(2);
  });
  it('with window=500 deduplicates events within window', () => {
    const evs = [makeEvent('click', 1000000), makeEvent('click', 1000400)];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('with window=500 keeps events outside window', () => {
    const evs = [makeEvent('click', 1000000), makeEvent('click', 1000600)];
    expect(deduplicate(evs, 500).length).toBe(2);
  });
  it('with window deduplicates chains', () => {
    const evs = [
      makeEvent('click', 1000000),
      makeEvent('click', 1000100),
      makeEvent('click', 1000200),
    ];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('deduplication is per type', () => {
    const evs = [makeEvent('click', 1000000), makeEvent('hover', 1000100)];
    expect(deduplicate(evs, 500).length).toBe(2);
  });
  it('window=0 falls back to exact dedup', () => {
    const ev1 = makeEvent('click', 1000000);
    const ev2 = makeEvent('click', 1000000);
    ev2.id = 'other-id';
    expect(deduplicate([ev1, ev2], 0).length).toBe(1);
  });
  it('dedup test #1: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1010000), { ...makeEvent('clickX', 1010400), id: 'dup-1' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #2: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1020000), { ...makeEvent('clickX', 1020800), id: 'dup-2' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #3: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1030000), { ...makeEvent('clickX', 1030000), id: 'dup-3' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #4: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1040000), { ...makeEvent('clickX', 1040400), id: 'dup-4' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #5: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1050000), { ...makeEvent('clickX', 1050800), id: 'dup-5' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #6: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1060000), { ...makeEvent('clickX', 1060000), id: 'dup-6' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #7: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1070000), { ...makeEvent('clickX', 1070400), id: 'dup-7' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #8: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1080000), { ...makeEvent('clickX', 1080800), id: 'dup-8' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #9: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1090000), { ...makeEvent('clickX', 1090000), id: 'dup-9' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #10: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1100000), { ...makeEvent('clickX', 1100400), id: 'dup-10' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #11: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1110000), { ...makeEvent('clickX', 1110800), id: 'dup-11' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #12: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1120000), { ...makeEvent('clickX', 1120000), id: 'dup-12' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #13: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1130000), { ...makeEvent('clickX', 1130400), id: 'dup-13' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #14: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1140000), { ...makeEvent('clickX', 1140800), id: 'dup-14' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #15: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1150000), { ...makeEvent('clickX', 1150000), id: 'dup-15' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #16: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1160000), { ...makeEvent('clickX', 1160400), id: 'dup-16' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #17: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1170000), { ...makeEvent('clickX', 1170800), id: 'dup-17' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #18: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1180000), { ...makeEvent('clickX', 1180000), id: 'dup-18' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #19: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1190000), { ...makeEvent('clickX', 1190400), id: 'dup-19' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #20: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1200000), { ...makeEvent('clickX', 1200800), id: 'dup-20' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #21: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1210000), { ...makeEvent('clickX', 1210000), id: 'dup-21' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #22: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1220000), { ...makeEvent('clickX', 1220400), id: 'dup-22' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #23: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1230000), { ...makeEvent('clickX', 1230800), id: 'dup-23' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #24: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1240000), { ...makeEvent('clickX', 1240000), id: 'dup-24' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #25: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1250000), { ...makeEvent('clickX', 1250400), id: 'dup-25' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #26: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1260000), { ...makeEvent('clickX', 1260800), id: 'dup-26' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #27: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1270000), { ...makeEvent('clickX', 1270000), id: 'dup-27' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #28: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1280000), { ...makeEvent('clickX', 1280400), id: 'dup-28' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #29: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1290000), { ...makeEvent('clickX', 1290800), id: 'dup-29' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #30: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1300000), { ...makeEvent('clickX', 1300000), id: 'dup-30' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #31: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1310000), { ...makeEvent('clickX', 1310400), id: 'dup-31' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #32: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1320000), { ...makeEvent('clickX', 1320800), id: 'dup-32' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #33: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1330000), { ...makeEvent('clickX', 1330000), id: 'dup-33' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #34: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1340000), { ...makeEvent('clickX', 1340400), id: 'dup-34' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #35: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1350000), { ...makeEvent('clickX', 1350800), id: 'dup-35' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #36: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1360000), { ...makeEvent('clickX', 1360000), id: 'dup-36' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #37: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1370000), { ...makeEvent('clickX', 1370400), id: 'dup-37' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #38: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1380000), { ...makeEvent('clickX', 1380800), id: 'dup-38' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #39: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1390000), { ...makeEvent('clickX', 1390000), id: 'dup-39' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #40: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1400000), { ...makeEvent('clickX', 1400400), id: 'dup-40' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #41: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1410000), { ...makeEvent('clickX', 1410800), id: 'dup-41' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #42: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1420000), { ...makeEvent('clickX', 1420000), id: 'dup-42' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #43: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1430000), { ...makeEvent('clickX', 1430400), id: 'dup-43' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #44: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1440000), { ...makeEvent('clickX', 1440800), id: 'dup-44' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #45: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1450000), { ...makeEvent('clickX', 1450000), id: 'dup-45' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #46: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1460000), { ...makeEvent('clickX', 1460400), id: 'dup-46' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #47: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1470000), { ...makeEvent('clickX', 1470800), id: 'dup-47' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #48: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1480000), { ...makeEvent('clickX', 1480000), id: 'dup-48' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #49: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1490000), { ...makeEvent('clickX', 1490400), id: 'dup-49' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #50: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1500000), { ...makeEvent('clickX', 1500800), id: 'dup-50' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #51: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1510000), { ...makeEvent('clickX', 1510000), id: 'dup-51' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #52: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1520000), { ...makeEvent('clickX', 1520400), id: 'dup-52' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #53: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1530000), { ...makeEvent('clickX', 1530800), id: 'dup-53' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #54: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1540000), { ...makeEvent('clickX', 1540000), id: 'dup-54' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #55: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1550000), { ...makeEvent('clickX', 1550400), id: 'dup-55' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #56: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1560000), { ...makeEvent('clickX', 1560800), id: 'dup-56' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #57: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1570000), { ...makeEvent('clickX', 1570000), id: 'dup-57' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #58: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1580000), { ...makeEvent('clickX', 1580400), id: 'dup-58' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #59: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1590000), { ...makeEvent('clickX', 1590800), id: 'dup-59' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #60: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1600000), { ...makeEvent('clickX', 1600000), id: 'dup-60' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #61: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1610000), { ...makeEvent('clickX', 1610400), id: 'dup-61' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #62: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1620000), { ...makeEvent('clickX', 1620800), id: 'dup-62' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #63: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1630000), { ...makeEvent('clickX', 1630000), id: 'dup-63' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #64: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1640000), { ...makeEvent('clickX', 1640400), id: 'dup-64' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #65: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1650000), { ...makeEvent('clickX', 1650800), id: 'dup-65' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #66: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1660000), { ...makeEvent('clickX', 1660000), id: 'dup-66' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #67: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1670000), { ...makeEvent('clickX', 1670400), id: 'dup-67' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #68: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1680000), { ...makeEvent('clickX', 1680800), id: 'dup-68' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #69: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1690000), { ...makeEvent('clickX', 1690000), id: 'dup-69' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #70: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1700000), { ...makeEvent('clickX', 1700400), id: 'dup-70' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #71: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1710000), { ...makeEvent('clickX', 1710800), id: 'dup-71' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #72: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1720000), { ...makeEvent('clickX', 1720000), id: 'dup-72' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #73: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1730000), { ...makeEvent('clickX', 1730400), id: 'dup-73' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #74: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1740000), { ...makeEvent('clickX', 1740800), id: 'dup-74' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #75: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1750000), { ...makeEvent('clickX', 1750000), id: 'dup-75' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #76: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1760000), { ...makeEvent('clickX', 1760400), id: 'dup-76' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #77: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1770000), { ...makeEvent('clickX', 1770800), id: 'dup-77' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #78: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1780000), { ...makeEvent('clickX', 1780000), id: 'dup-78' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #79: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1790000), { ...makeEvent('clickX', 1790400), id: 'dup-79' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #80: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1800000), { ...makeEvent('clickX', 1800800), id: 'dup-80' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #81: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1810000), { ...makeEvent('clickX', 1810000), id: 'dup-81' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #82: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1820000), { ...makeEvent('clickX', 1820400), id: 'dup-82' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #83: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1830000), { ...makeEvent('clickX', 1830800), id: 'dup-83' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #84: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1840000), { ...makeEvent('clickX', 1840000), id: 'dup-84' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #85: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1850000), { ...makeEvent('clickX', 1850400), id: 'dup-85' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #86: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1860000), { ...makeEvent('clickX', 1860800), id: 'dup-86' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #87: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1870000), { ...makeEvent('clickX', 1870000), id: 'dup-87' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
  it('dedup test #88: window=500, ts diff=400, expect=1', () => {
    const evs = [makeEvent('clickX', 1880000), { ...makeEvent('clickX', 1880400), id: 'dup-88' }];
    expect(deduplicate(evs, 500).length).toBe(1);
  });
  it('dedup test #89: window=1000, ts diff=800, expect=1', () => {
    const evs = [makeEvent('clickX', 1890000), { ...makeEvent('clickX', 1890800), id: 'dup-89' }];
    expect(deduplicate(evs, 1000).length).toBe(1);
  });
  it('dedup test #90: window=0, ts diff=0, expect=1', () => {
    const evs = [makeEvent('clickX', 1900000), { ...makeEvent('clickX', 1900000), id: 'dup-90' }];
    // window=0 exact dedup: same ts gives 1, diff ts gives 2
    expect(deduplicate(evs).length).toBe(1);
  });
});

// ─── Section 8: serializeLog / deserializeLog ───
describe('serializeLog / deserializeLog', () => {
  it('serializeLog returns a string', () => {
    const log = createEventLog();
    expect(typeof serializeLog(log)).toBe('string');
  });
  it('serializeLog of empty log gives []', () => {
    const log = createEventLog();
    expect(serializeLog(log)).toBe('[]');
  });
  it('deserializeLog restores event count', () => {
    const raw = [{ id: 's1', timestamp: 1000000, type: 'click', payload: null }];
    const log = deserializeLog(JSON.stringify(raw));
    expect(log.count()).toBe(1);
  });
  it('deserializeLog restores event type', () => {
    const raw = [{ id: 's1', timestamp: 1000000, type: 'login', payload: null }];
    const log = deserializeLog(JSON.stringify(raw));
    expect(log.getAll()[0].type).toBe('login');
  });
  it('deserializeLog restores event timestamp', () => {
    const raw = [{ id: 's1', timestamp: 1234567, type: 'x', payload: null }];
    const log = deserializeLog(JSON.stringify(raw));
    expect(log.getAll()[0].timestamp).toBe(1234567);
  });
  it('deserializeLog restores event payload', () => {
    const raw = [{ id: 's1', timestamp: 1000000, type: 'x', payload: { a: 1 } }];
    const log = deserializeLog(JSON.stringify(raw));
    expect(log.getAll()[0].payload).toEqual({ a: 1 });
  });
  it('round-trip serialize/deserialize preserves all events', () => {
    const log = createEventLog();
    log.append({ type: 'click', payload: 1 });
    log.append({ type: 'hover', payload: 2 });
    const serialized = serializeLog(log);
    const restored = deserializeLog(serialized);
    expect(restored.count()).toBe(2);
  });
  it('deserializeLog allows further appends', () => {
    const raw = [{ id: 's1', timestamp: 1000000, type: 'click', payload: null }];
    const log = deserializeLog(JSON.stringify(raw));
    log.append({ type: 'new', payload: 99 });
    expect(log.count()).toBe(2);
  });
  it('deserializeLog empty array gives empty log', () => {
    const log = deserializeLog('[]');
    expect(log.count()).toBe(0);
  });
  it('deserializeLog with metadata preserves metadata', () => {
    const raw = [{ id: 's1', timestamp: 1000000, type: 'x', payload: null, metadata: { src: 'api' } }];
    const log = deserializeLog(JSON.stringify(raw));
    expect(log.getAll()[0].metadata).toEqual({ src: 'api' });
  });
});
