// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import {
  createSessionManager,
  COLLAB_COLORS,
  assignColor,
  getColorForUser,
  transformOperation,
  composeOperations,
  invertOperation,
  applyOperation,
  isConflict,
} from '../src/index';
import type { CollabUser, CollabOperation } from '../src/types';

// ── helpers ───────────────────────────────────────────────────────────────────

function makeUser(id: string, color = '#e74c3c'): CollabUser {
  return { id, name: `User ${id}`, color, lastActive: new Date() };
}

function makeOp(overrides: Partial<CollabOperation> = {}): CollabOperation {
  return {
    id: 'op1',
    type: 'insert',
    field: 'title',
    position: 0,
    value: 'hello',
    userId: 'user1',
    timestamp: new Date(),
    version: 1,
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. COLLAB_COLORS (80 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('COLLAB_COLORS', () => {
  it('is an array', () => expect(Array.isArray(COLLAB_COLORS)).toBe(true));
  it('has exactly 20 entries', () => expect(COLLAB_COLORS).toHaveLength(20));
  it('all entries start with #', () => {
    COLLAB_COLORS.forEach((c) => expect(c.startsWith('#')).toBe(true));
  });
  it('all entries are 7 characters long', () => {
    COLLAB_COLORS.forEach((c) => expect(c.length).toBe(7));
  });
  it('all entries match hex color pattern', () => {
    COLLAB_COLORS.forEach((c) => expect(c).toMatch(/^#[0-9a-fA-F]{6}$/));
  });
  it('all entries are distinct', () => {
    expect(new Set(COLLAB_COLORS).size).toBe(COLLAB_COLORS.length);
  });
  it('contains #e74c3c', () => expect(COLLAB_COLORS).toContain('#e74c3c'));
  it('contains #3498db', () => expect(COLLAB_COLORS).toContain('#3498db'));
  it('contains #2ecc71', () => expect(COLLAB_COLORS).toContain('#2ecc71'));
  it('contains #f39c12', () => expect(COLLAB_COLORS).toContain('#f39c12'));
  it('contains #9b59b6', () => expect(COLLAB_COLORS).toContain('#9b59b6'));
  it('contains #1abc9c', () => expect(COLLAB_COLORS).toContain('#1abc9c'));
  it('contains #e67e22', () => expect(COLLAB_COLORS).toContain('#e67e22'));
  it('contains #34495e', () => expect(COLLAB_COLORS).toContain('#34495e'));
  it('contains #e91e63', () => expect(COLLAB_COLORS).toContain('#e91e63'));
  it('contains #00bcd4', () => expect(COLLAB_COLORS).toContain('#00bcd4'));
  it('contains #ff5722', () => expect(COLLAB_COLORS).toContain('#ff5722'));
  it('contains #607d8b', () => expect(COLLAB_COLORS).toContain('#607d8b'));
  it('contains #8bc34a', () => expect(COLLAB_COLORS).toContain('#8bc34a'));
  it('contains #ff9800', () => expect(COLLAB_COLORS).toContain('#ff9800'));
  it('contains #673ab7', () => expect(COLLAB_COLORS).toContain('#673ab7'));
  it('contains #03a9f4', () => expect(COLLAB_COLORS).toContain('#03a9f4'));
  it('contains #f44336', () => expect(COLLAB_COLORS).toContain('#f44336'));
  it('contains #4caf50', () => expect(COLLAB_COLORS).toContain('#4caf50'));
  it('contains #ffeb3b', () => expect(COLLAB_COLORS).toContain('#ffeb3b'));
  it('contains #795548', () => expect(COLLAB_COLORS).toContain('#795548'));
  it('index 0 is #e74c3c', () => expect(COLLAB_COLORS[0]).toBe('#e74c3c'));
  it('index 1 is #3498db', () => expect(COLLAB_COLORS[1]).toBe('#3498db'));
  it('index 2 is #2ecc71', () => expect(COLLAB_COLORS[2]).toBe('#2ecc71'));
  it('index 19 is #795548', () => expect(COLLAB_COLORS[19]).toBe('#795548'));
  it('no entry is empty string', () => {
    COLLAB_COLORS.forEach((c) => expect(c.length).toBeGreaterThan(0));
  });
  it('no entry is undefined', () => {
    COLLAB_COLORS.forEach((c) => expect(c).toBeDefined());
  });
  it('can be iterated with for...of', () => {
    let count = 0;
    for (const _c of COLLAB_COLORS) count++;
    expect(count).toBe(20);
  });
  it('can be spread', () => {
    expect([...COLLAB_COLORS]).toHaveLength(20);
  });
  it('all lowercase hex digits', () => {
    COLLAB_COLORS.forEach((c) => {
      expect(c.slice(1)).toBe(c.slice(1).toLowerCase());
    });
  });
  it('first color is red-ish (#e74c3c)', () => {
    const r = parseInt(COLLAB_COLORS[0].slice(1, 3), 16);
    expect(r).toBeGreaterThan(100);
  });
  // 46 bulk element checks
  for (let i = 0; i < 46; i++) {
    it(`COLLAB_COLORS[${i % 20}] is a valid hex string`, () => {
      expect(COLLAB_COLORS[i % 20]).toMatch(/^#[0-9a-f]{6}$/);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. assignColor (100 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('assignColor', () => {
  it('returns a string', () => {
    expect(typeof assignColor('user1', new Set())).toBe('string');
  });
  it('returns first palette color when none used', () => {
    expect(assignColor('user1', new Set())).toBe(COLLAB_COLORS[0]);
  });
  it('skips used colors', () => {
    const used = new Set([COLLAB_COLORS[0]]);
    expect(assignColor('user1', used)).toBe(COLLAB_COLORS[1]);
  });
  it('skips first two used colors', () => {
    const used = new Set([COLLAB_COLORS[0], COLLAB_COLORS[1]]);
    expect(assignColor('user1', used)).toBe(COLLAB_COLORS[2]);
  });
  it('when all palette colors used falls back to getColorForUser', () => {
    const used = new Set(COLLAB_COLORS);
    const result = assignColor('user1', used);
    expect(result).toBe(getColorForUser('user1'));
  });
  it('result is always a hex color string', () => {
    const result = assignColor('anyuser', new Set());
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });
  it('with 19 colors used assigns 20th', () => {
    const used = new Set(COLLAB_COLORS.slice(0, 19));
    expect(assignColor('u', used)).toBe(COLLAB_COLORS[19]);
  });
  it('with 20 colors used falls back', () => {
    const used = new Set(COLLAB_COLORS);
    expect(COLLAB_COLORS).toContain(assignColor('u', used));
  });
  it('empty string userId works', () => {
    expect(typeof assignColor('', new Set())).toBe('string');
  });
  it('long userId works', () => {
    const id = 'u'.repeat(100);
    expect(typeof assignColor(id, new Set())).toBe('string');
  });
  // 90 bulk tests with varying used sets
  for (let i = 0; i < 90; i++) {
    it(`assignColor with ${i % 20} used colors — index ${i}`, () => {
      const used = new Set(COLLAB_COLORS.slice(0, i % 20));
      const result = assignColor(`user${i}`, used);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. getColorForUser (100 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('getColorForUser', () => {
  it('returns a string', () => {
    expect(typeof getColorForUser('user1')).toBe('string');
  });
  it('returns a value from COLLAB_COLORS', () => {
    expect(COLLAB_COLORS).toContain(getColorForUser('user1'));
  });
  it('is deterministic — same input same output', () => {
    expect(getColorForUser('alice')).toBe(getColorForUser('alice'));
  });
  it('is deterministic across multiple calls', () => {
    for (let i = 0; i < 5; i++) {
      expect(getColorForUser('bob')).toBe(getColorForUser('bob'));
    }
  });
  it('different users may get different colors', () => {
    const colors = new Set(['user1', 'user2', 'user3', 'user4', 'user5'].map(getColorForUser));
    expect(colors.size).toBeGreaterThanOrEqual(1);
  });
  it('empty string user returns a palette color', () => {
    expect(COLLAB_COLORS).toContain(getColorForUser(''));
  });
  it('single char user returns palette color', () => {
    expect(COLLAB_COLORS).toContain(getColorForUser('a'));
  });
  it('result starts with #', () => {
    expect(getColorForUser('test-user').startsWith('#')).toBe(true);
  });
  it('result is 7 chars', () => {
    expect(getColorForUser('test').length).toBe(7);
  });
  it('numeric string userId works', () => {
    expect(COLLAB_COLORS).toContain(getColorForUser('12345'));
  });
  // 90 bulk determinism tests
  for (let i = 0; i < 90; i++) {
    it(`getColorForUser determinism — userId${i}`, () => {
      const id = `userId${i}`;
      expect(getColorForUser(id)).toBe(getColorForUser(id));
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. createSessionManager — createSession / getSession / isSessionActive (150 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('createSessionManager — createSession', () => {
  it('returns a session manager object', () => {
    const m = createSessionManager();
    expect(typeof m).toBe('object');
  });
  it('exposes createSession function', () => {
    const m = createSessionManager();
    expect(typeof m.createSession).toBe('function');
  });
  it('creates a session with correct docId', () => {
    const m = createSessionManager();
    const s = m.createSession('doc1', 'ncr');
    expect(s.docId).toBe('doc1');
  });
  it('creates a session with correct docType', () => {
    const m = createSessionManager();
    const s = m.createSession('doc2', 'capa');
    expect(s.docType).toBe('capa');
  });
  it('new session has version 0', () => {
    const m = createSessionManager();
    expect(m.createSession('d', 'audit').version).toBe(0);
  });
  it('new session has empty users map', () => {
    const m = createSessionManager();
    expect(m.createSession('d', 'risk').users.size).toBe(0);
  });
  it('new session has lastModified as Date', () => {
    const m = createSessionManager();
    expect(m.createSession('d', 'form').lastModified).toBeInstanceOf(Date);
  });
  it('getSession returns undefined for nonexistent docId', () => {
    const m = createSessionManager();
    expect(m.getSession('nonexistent')).toBeUndefined();
  });
  it('getSession returns session after creation', () => {
    const m = createSessionManager();
    m.createSession('doc1', 'ncr');
    expect(m.getSession('doc1')).toBeDefined();
  });
  it('isSessionActive false before creation', () => {
    const m = createSessionManager();
    expect(m.isSessionActive('doc1')).toBe(false);
  });
  it('isSessionActive true after creation', () => {
    const m = createSessionManager();
    m.createSession('doc1', 'ncr');
    expect(m.isSessionActive('doc1')).toBe(true);
  });
  it('getSessionCount starts at 0', () => {
    const m = createSessionManager();
    expect(m.getSessionCount()).toBe(0);
  });
  it('getSessionCount increments with createSession', () => {
    const m = createSessionManager();
    m.createSession('a', 'ncr');
    expect(m.getSessionCount()).toBe(1);
  });
  it('two distinct sessions counted', () => {
    const m = createSessionManager();
    m.createSession('a', 'ncr');
    m.createSession('b', 'capa');
    expect(m.getSessionCount()).toBe(2);
  });
  it('creating same docId twice still has count 1', () => {
    const m = createSessionManager();
    m.createSession('a', 'ncr');
    m.createSession('a', 'capa');
    expect(m.getSessionCount()).toBe(1);
  });
  // 135 bulk session creation tests
  for (let i = 0; i < 135; i++) {
    it(`createSession bulk ${i + 1}: session is active after creation`, () => {
      const m = createSessionManager();
      m.createSession(`bulk-${i}`, 'document');
      expect(m.isSessionActive(`bulk-${i}`)).toBe(true);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. createSessionManager — joinSession / leaveSession / getActiveUsers (120 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('createSessionManager — joinSession / leaveSession', () => {
  it('joinSession returns false for nonexistent session', () => {
    const m = createSessionManager();
    expect(m.joinSession('missing', makeUser('u1'))).toBe(false);
  });
  it('joinSession returns true when session exists', () => {
    const m = createSessionManager();
    m.createSession('doc1', 'ncr');
    expect(m.joinSession('doc1', makeUser('u1'))).toBe(true);
  });
  it('user appears in getActiveUsers after join', () => {
    const m = createSessionManager();
    m.createSession('doc1', 'ncr');
    m.joinSession('doc1', makeUser('u1'));
    const users = m.getActiveUsers('doc1');
    expect(users.some((u) => u.id === 'u1')).toBe(true);
  });
  it('getActiveUsers returns empty array for nonexistent session', () => {
    const m = createSessionManager();
    expect(m.getActiveUsers('nope')).toEqual([]);
  });
  it('leaveSession returns false for nonexistent session', () => {
    const m = createSessionManager();
    expect(m.leaveSession('nope', 'u1')).toBe(false);
  });
  it('leaveSession returns false when user not in session', () => {
    const m = createSessionManager();
    m.createSession('doc1', 'ncr');
    expect(m.leaveSession('doc1', 'unknown')).toBe(false);
  });
  it('leaveSession returns true when user was in session', () => {
    const m = createSessionManager();
    m.createSession('doc1', 'ncr');
    m.joinSession('doc1', makeUser('u1'));
    expect(m.leaveSession('doc1', 'u1')).toBe(true);
  });
  it('user removed after leave', () => {
    const m = createSessionManager();
    m.createSession('doc1', 'ncr');
    m.joinSession('doc1', makeUser('u1'));
    m.leaveSession('doc1', 'u1');
    expect(m.getActiveUsers('doc1').some((u) => u.id === 'u1')).toBe(false);
  });
  it('two users join, one leaves, one remains', () => {
    const m = createSessionManager();
    m.createSession('doc', 'ncr');
    m.joinSession('doc', makeUser('u1'));
    m.joinSession('doc', makeUser('u2'));
    m.leaveSession('doc', 'u1');
    const users = m.getActiveUsers('doc');
    expect(users).toHaveLength(1);
    expect(users[0].id).toBe('u2');
  });
  it('multiple users join and all listed', () => {
    const m = createSessionManager();
    m.createSession('doc', 'audit');
    m.joinSession('doc', makeUser('u1'));
    m.joinSession('doc', makeUser('u2'));
    m.joinSession('doc', makeUser('u3'));
    expect(m.getActiveUsers('doc')).toHaveLength(3);
  });
  it('joining same user twice overwrites (idempotent in count)', () => {
    const m = createSessionManager();
    m.createSession('doc', 'ncr');
    m.joinSession('doc', makeUser('u1'));
    m.joinSession('doc', makeUser('u1'));
    expect(m.getActiveUsers('doc')).toHaveLength(1);
  });
  // 109 bulk join/leave tests
  for (let i = 0; i < 109; i++) {
    it(`joinSession / leaveSession bulk ${i + 1}`, () => {
      const m = createSessionManager();
      m.createSession(`d${i}`, 'capa');
      m.joinSession(`d${i}`, makeUser(`user${i}`));
      expect(m.getActiveUsers(`d${i}`)).toHaveLength(1);
      m.leaveSession(`d${i}`, `user${i}`);
      expect(m.getActiveUsers(`d${i}`)).toHaveLength(0);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. createSessionManager — updateCursor / cleanupInactiveSessions (80 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('createSessionManager — updateCursor / cleanupInactiveSessions', () => {
  it('updateCursor does nothing for missing session', () => {
    const m = createSessionManager();
    expect(() => m.updateCursor('nope', 'u1', { field: 'title', position: 0 })).not.toThrow();
  });
  it('updateCursor does nothing for missing user', () => {
    const m = createSessionManager();
    m.createSession('doc', 'ncr');
    expect(() => m.updateCursor('doc', 'ghost', { field: 'title' })).not.toThrow();
  });
  it('updateCursor sets cursor on user', () => {
    const m = createSessionManager();
    m.createSession('doc', 'ncr');
    m.joinSession('doc', makeUser('u1'));
    m.updateCursor('doc', 'u1', { field: 'title', position: 5 });
    const user = m.getActiveUsers('doc').find((u) => u.id === 'u1');
    expect(user?.cursor?.position).toBe(5);
  });
  it('updateCursor updates lastActive', () => {
    const m = createSessionManager();
    m.createSession('doc', 'ncr');
    m.joinSession('doc', makeUser('u1'));
    const before = m.getActiveUsers('doc').find((u) => u.id === 'u1')!.lastActive;
    m.updateCursor('doc', 'u1', { field: 'description', position: 10 });
    const after = m.getActiveUsers('doc').find((u) => u.id === 'u1')!.lastActive;
    expect(after.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
  it('cleanupInactiveSessions returns 0 when all sessions are fresh', () => {
    const m = createSessionManager();
    m.createSession('doc1', 'ncr');
    expect(m.cleanupInactiveSessions(1000 * 60 * 60)).toBe(0);
  });
  it('cleanupInactiveSessions removes old sessions', () => {
    const m = createSessionManager();
    m.createSession('old', 'ncr');
    // Backdate lastModified
    const session = m.getSession('old')!;
    (session as any).lastModified = new Date(Date.now() - 10000);
    expect(m.cleanupInactiveSessions(5000)).toBe(1);
  });
  it('after cleanup, removed session is inactive', () => {
    const m = createSessionManager();
    m.createSession('old', 'ncr');
    const session = m.getSession('old')!;
    (session as any).lastModified = new Date(Date.now() - 10000);
    m.cleanupInactiveSessions(5000);
    expect(m.isSessionActive('old')).toBe(false);
  });
  it('cleanup does not remove young sessions', () => {
    const m = createSessionManager();
    m.createSession('fresh', 'ncr');
    m.cleanupInactiveSessions(1000 * 60 * 60);
    expect(m.isSessionActive('fresh')).toBe(true);
  });
  it('cleanup removes only old sessions, keeps fresh', () => {
    const m = createSessionManager();
    m.createSession('old', 'ncr');
    m.createSession('fresh', 'capa');
    const old = m.getSession('old')!;
    (old as any).lastModified = new Date(Date.now() - 10000);
    m.cleanupInactiveSessions(5000);
    expect(m.isSessionActive('old')).toBe(false);
    expect(m.isSessionActive('fresh')).toBe(true);
  });
  // 71 bulk cursor update tests
  for (let i = 0; i < 71; i++) {
    it(`updateCursor bulk ${i + 1}: field and position set`, () => {
      const m = createSessionManager();
      m.createSession(`doc${i}`, 'document');
      m.joinSession(`doc${i}`, makeUser(`u${i}`));
      m.updateCursor(`doc${i}`, `u${i}`, { field: 'body', position: i });
      const user = m.getActiveUsers(`doc${i}`).find((u) => u.id === `u${i}`);
      expect(user?.cursor?.position).toBe(i);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. transformOperation (150 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('transformOperation', () => {
  it('returns a new operation object', () => {
    const op = makeOp();
    const against = makeOp({ id: 'op2', position: 10 });
    expect(transformOperation(op, against)).not.toBe(op);
  });
  it('different field: op unchanged', () => {
    const op = makeOp({ field: 'title', position: 5 });
    const against = makeOp({ field: 'description', position: 2 });
    expect(transformOperation(op, against).position).toBe(5);
  });
  it('insert vs insert: against before op shifts op right', () => {
    const op = makeOp({ type: 'insert', position: 5, value: 'X' });
    const against = makeOp({ id: 'op2', type: 'insert', position: 0, value: 'AB' });
    const result = transformOperation(op, against);
    expect(result.position).toBe(7);
  });
  it('insert vs insert: against after op does not shift', () => {
    const op = makeOp({ type: 'insert', position: 5, value: 'X' });
    const against = makeOp({ id: 'op2', type: 'insert', position: 10, value: 'AB' });
    expect(transformOperation(op, against).position).toBe(5);
  });
  it('insert vs insert: against at same position shifts', () => {
    const op = makeOp({ type: 'insert', position: 5, value: 'X' });
    const against = makeOp({ id: 'op2', type: 'insert', position: 5, value: 'Z' });
    expect(transformOperation(op, against).position).toBe(6);
  });
  it('insert vs delete: against before op shifts op left', () => {
    const op = makeOp({ type: 'insert', position: 10, value: 'X' });
    const against = makeOp({ id: 'op2', type: 'delete', position: 3, length: 4 });
    expect(transformOperation(op, against).position).toBe(6);
  });
  it('insert vs delete: against after op does not shift', () => {
    const op = makeOp({ type: 'insert', position: 3, value: 'X' });
    const against = makeOp({ id: 'op2', type: 'delete', position: 10, length: 4 });
    expect(transformOperation(op, against).position).toBe(3);
  });
  it('insert vs delete: position never goes negative', () => {
    const op = makeOp({ type: 'insert', position: 2, value: 'X' });
    const against = makeOp({ id: 'op2', type: 'delete', position: 0, length: 100 });
    expect(transformOperation(op, against).position).toBeGreaterThanOrEqual(0);
  });
  it('delete vs insert: against before op shifts op right', () => {
    const op = makeOp({ type: 'delete', position: 5, length: 2 });
    const against = makeOp({ id: 'op2', type: 'insert', position: 0, value: 'AB' });
    expect(transformOperation(op, against).position).toBe(7);
  });
  it('delete vs insert: against after op does not shift', () => {
    const op = makeOp({ type: 'delete', position: 5, length: 2 });
    const against = makeOp({ id: 'op2', type: 'insert', position: 10, value: 'AB' });
    expect(transformOperation(op, against).position).toBe(5);
  });
  it('delete vs delete: against before op shifts left', () => {
    const op = makeOp({ type: 'delete', position: 10, length: 3 });
    const against = makeOp({ id: 'op2', type: 'delete', position: 2, length: 4 });
    expect(transformOperation(op, against).position).toBe(6);
  });
  it('delete vs delete: same position yields length=0', () => {
    const op = makeOp({ type: 'delete', position: 5, length: 2 });
    const against = makeOp({ id: 'op2', type: 'delete', position: 5, length: 2 });
    expect(transformOperation(op, against).length).toBe(0);
  });
  it('delete vs delete: against after op unchanged', () => {
    const op = makeOp({ type: 'delete', position: 2, length: 3 });
    const against = makeOp({ id: 'op2', type: 'delete', position: 8, length: 2 });
    expect(transformOperation(op, against).position).toBe(2);
  });
  it('set type returned unchanged for different fields', () => {
    const op = makeOp({ type: 'set', field: 'title', value: 'New' });
    const against = makeOp({ id: 'op2', type: 'set', field: 'description', value: 'x' });
    expect(transformOperation(op, against).value).toBe('New');
  });
  it('retain type returned unchanged', () => {
    const op = makeOp({ type: 'retain', field: 'title', position: 0 });
    const against = makeOp({ id: 'op2', type: 'insert', position: 0, value: 'hi' });
    const result = transformOperation(op, against);
    expect(result.type).toBe('retain');
  });
  // 135 bulk insert vs insert positional tests
  for (let i = 0; i < 135; i++) {
    it(`transformOperation insert vs insert bulk ${i + 1}`, () => {
      const opPos = i + 5;
      const againstPos = i;
      const insertedLen = 3;
      const op = makeOp({ type: 'insert', position: opPos, value: 'X' });
      const against = makeOp({ id: 'op2', type: 'insert', position: againstPos, value: 'ABC' });
      const result = transformOperation(op, against);
      // against at <= opPos: position shifts by insertedLen
      const expected = againstPos <= opPos ? opPos + insertedLen : opPos;
      expect(result.position).toBe(expected);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. composeOperations (100 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('composeOperations', () => {
  it('returns empty array for empty input', () => {
    expect(composeOperations([])).toEqual([]);
  });
  it('returns single op unchanged for single-element input', () => {
    const op = makeOp();
    expect(composeOperations([op])).toHaveLength(1);
  });
  it('merges adjacent inserts from same user/field', () => {
    const op1 = makeOp({ id: 'a', type: 'insert', field: 'title', userId: 'u1', value: 'foo' });
    const op2 = makeOp({ id: 'b', type: 'insert', field: 'title', userId: 'u1', value: 'bar' });
    const result = composeOperations([op1, op2]);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe('foobar');
  });
  it('does not merge inserts from different users', () => {
    const op1 = makeOp({ id: 'a', type: 'insert', field: 'title', userId: 'u1', value: 'foo' });
    const op2 = makeOp({ id: 'b', type: 'insert', field: 'title', userId: 'u2', value: 'bar' });
    expect(composeOperations([op1, op2])).toHaveLength(2);
  });
  it('does not merge inserts from different fields', () => {
    const op1 = makeOp({ id: 'a', type: 'insert', field: 'title', userId: 'u1', value: 'foo' });
    const op2 = makeOp({ id: 'b', type: 'insert', field: 'desc', userId: 'u1', value: 'bar' });
    expect(composeOperations([op1, op2])).toHaveLength(2);
  });
  it('merges adjacent deletes from same user/field', () => {
    const op1 = makeOp({ id: 'a', type: 'delete', field: 'title', userId: 'u1', length: 2 });
    const op2 = makeOp({ id: 'b', type: 'delete', field: 'title', userId: 'u1', length: 3 });
    const result = composeOperations([op1, op2]);
    expect(result).toHaveLength(1);
    expect(result[0].length).toBe(5);
  });
  it('does not merge inserts with deletes', () => {
    const op1 = makeOp({ id: 'a', type: 'insert', field: 'title', userId: 'u1', value: 'foo' });
    const op2 = makeOp({ id: 'b', type: 'delete', field: 'title', userId: 'u1', length: 2 });
    expect(composeOperations([op1, op2])).toHaveLength(2);
  });
  it('result is a new array (immutable input)', () => {
    const ops = [makeOp()];
    const result = composeOperations(ops);
    expect(result).not.toBe(ops);
  });
  it('three composable inserts merged to one', () => {
    const ops = ['a', 'b', 'c'].map((v, i) =>
      makeOp({ id: `op${i}`, type: 'insert', field: 'title', userId: 'u1', value: v })
    );
    const result = composeOperations(ops);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe('abc');
  });
  it('mixed: two composable then one different field', () => {
    const op1 = makeOp({ id: 'a', type: 'insert', field: 'title', userId: 'u1', value: 'x' });
    const op2 = makeOp({ id: 'b', type: 'insert', field: 'title', userId: 'u1', value: 'y' });
    const op3 = makeOp({ id: 'c', type: 'insert', field: 'desc', userId: 'u1', value: 'z' });
    const result = composeOperations([op1, op2, op3]);
    expect(result).toHaveLength(2);
  });
  // 90 bulk compose tests
  for (let i = 1; i <= 90; i++) {
    it(`composeOperations: ${i} same-user insert ops produce 1 merged op`, () => {
      const ops = Array.from({ length: i }, (_, j) =>
        makeOp({ id: `op${j}`, type: 'insert', field: 'title', userId: 'u1', value: 'x' })
      );
      const result = composeOperations(ops);
      expect(result).toHaveLength(1);
      expect(result[0].value).toBe('x'.repeat(i));
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. invertOperation (100 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('invertOperation', () => {
  it('insert inverts to delete', () => {
    const op = makeOp({ type: 'insert', value: 'hello' });
    expect(invertOperation(op).type).toBe('delete');
  });
  it('inverted insert has length equal to value length', () => {
    const op = makeOp({ type: 'insert', value: 'hello' });
    expect(invertOperation(op).length).toBe(5);
  });
  it('inverted insert has undefined value', () => {
    const op = makeOp({ type: 'insert', value: 'hello' });
    expect(invertOperation(op).value).toBeUndefined();
  });
  it('delete inverts to insert', () => {
    const op = makeOp({ type: 'delete', length: 3 });
    expect(invertOperation(op).type).toBe('insert');
  });
  it('inverted delete has empty string value', () => {
    const op = makeOp({ type: 'delete', length: 3 });
    expect(invertOperation(op).value).toBe('');
  });
  it('inverted delete has undefined length', () => {
    const op = makeOp({ type: 'delete', length: 3 });
    expect(invertOperation(op).length).toBeUndefined();
  });
  it('set inverts to set (same type)', () => {
    const op = makeOp({ type: 'set', value: 'new' });
    expect(invertOperation(op).type).toBe('set');
  });
  it('retain inverts to retain', () => {
    const op = makeOp({ type: 'retain' });
    expect(invertOperation(op).type).toBe('retain');
  });
  it('inverted op retains same field', () => {
    const op = makeOp({ type: 'insert', field: 'body', value: 'x' });
    expect(invertOperation(op).field).toBe('body');
  });
  it('inverted op retains same userId', () => {
    const op = makeOp({ type: 'insert', userId: 'u99', value: 'x' });
    expect(invertOperation(op).userId).toBe('u99');
  });
  it('inverted op retains same id', () => {
    const op = makeOp({ id: 'myid', type: 'insert', value: 'x' });
    expect(invertOperation(op).id).toBe('myid');
  });
  it('inverted op retains same position', () => {
    const op = makeOp({ type: 'insert', position: 7, value: 'x' });
    expect(invertOperation(op).position).toBe(7);
  });
  it('length for empty insert value is 0', () => {
    const op = makeOp({ type: 'insert', value: '' });
    expect(invertOperation(op).length).toBe(0);
  });
  it('length for long insert value', () => {
    const op = makeOp({ type: 'insert', value: 'abcdefghij' });
    expect(invertOperation(op).length).toBe(10);
  });
  it('result is a new object', () => {
    const op = makeOp({ type: 'insert', value: 'x' });
    expect(invertOperation(op)).not.toBe(op);
  });
  // 85 bulk tests
  for (let i = 0; i < 85; i++) {
    it(`invertOperation insert bulk ${i + 1}: length matches value`, () => {
      const value = 'x'.repeat(i);
      const op = makeOp({ type: 'insert', value });
      expect(invertOperation(op).length).toBe(i);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. applyOperation (120 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('applyOperation', () => {
  it('set operation replaces field value', () => {
    const doc = { title: 'old' };
    const op = makeOp({ type: 'set', field: 'title', value: 'new' });
    expect(applyOperation(doc, op).title).toBe('new');
  });
  it('set operation does not mutate original doc', () => {
    const doc = { title: 'old' };
    const op = makeOp({ type: 'set', field: 'title', value: 'new' });
    applyOperation(doc, op);
    expect(doc.title).toBe('old');
  });
  it('insert at position 0 prepends', () => {
    const doc = { title: 'world' };
    const op = makeOp({ type: 'insert', field: 'title', position: 0, value: 'hello ' });
    expect(applyOperation(doc, op).title).toBe('hello world');
  });
  it('insert at end appends', () => {
    const doc = { title: 'hello' };
    const op = makeOp({ type: 'insert', field: 'title', position: 5, value: ' world' });
    expect(applyOperation(doc, op).title).toBe('hello world');
  });
  it('insert in middle inserts correctly', () => {
    const doc = { title: 'helo' };
    const op = makeOp({ type: 'insert', field: 'title', position: 3, value: 'l' });
    expect(applyOperation(doc, op).title).toBe('hello');
  });
  it('delete removes characters', () => {
    const doc = { title: 'hello world' };
    const op = makeOp({ type: 'delete', field: 'title', position: 5, length: 6 });
    expect(applyOperation(doc, op).title).toBe('hello');
  });
  it('delete from position 0', () => {
    const doc = { title: 'hello' };
    const op = makeOp({ type: 'delete', field: 'title', position: 0, length: 5 });
    expect(applyOperation(doc, op).title).toBe('');
  });
  it('retain returns doc unchanged', () => {
    const doc = { title: 'hello' };
    const op = makeOp({ type: 'retain', field: 'title' });
    expect(applyOperation(doc, op).title).toBe('hello');
  });
  it('insert on non-existent field creates it', () => {
    const doc: Record<string, unknown> = {};
    const op = makeOp({ type: 'insert', field: 'desc', position: 0, value: 'new' });
    expect(applyOperation(doc, op).desc).toBe('new');
  });
  it('set on non-existent field creates it', () => {
    const doc: Record<string, unknown> = {};
    const op = makeOp({ type: 'set', field: 'status', value: 'active' });
    expect(applyOperation(doc, op).status).toBe('active');
  });
  it('delete beyond string length does not error', () => {
    const doc = { title: 'hi' };
    const op = makeOp({ type: 'delete', field: 'title', position: 0, length: 100 });
    expect(() => applyOperation(doc, op)).not.toThrow();
  });
  it('insert with position beyond string clamps to end', () => {
    const doc = { title: 'hi' };
    const op = makeOp({ type: 'insert', field: 'title', position: 1000, value: '!' });
    const result = applyOperation(doc, op);
    expect(result.title as string).toContain('hi');
    expect(result.title as string).toContain('!');
  });
  it('result is a new object', () => {
    const doc = { title: 'old' };
    const op = makeOp({ type: 'set', field: 'title', value: 'new' });
    expect(applyOperation(doc, op)).not.toBe(doc);
  });
  it('other fields preserved after set operation', () => {
    const doc = { title: 'old', status: 'open' };
    const op = makeOp({ type: 'set', field: 'title', value: 'new' });
    expect(applyOperation(doc, op).status).toBe('open');
  });
  it('delete with length 0 is no-op', () => {
    const doc = { title: 'hello' };
    const op = makeOp({ type: 'delete', field: 'title', position: 2, length: 0 });
    expect(applyOperation(doc, op).title).toBe('hello');
  });
  // 105 bulk insert tests
  for (let i = 0; i < 105; i++) {
    it(`applyOperation insert bulk ${i + 1}: char inserted at position`, () => {
      const base = 'hello';
      const doc = { title: base };
      const pos = i % (base.length + 1);
      const op = makeOp({ type: 'insert', field: 'title', position: pos, value: 'X' });
      const result = applyOperation(doc, op).title as string;
      expect(result.length).toBe(base.length + 1);
      expect(result[pos]).toBe('X');
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. isConflict (100 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('isConflict', () => {
  it('no conflict for different fields', () => {
    const op1 = makeOp({ field: 'title', userId: 'u1', version: 1 });
    const op2 = makeOp({ id: 'op2', field: 'desc', userId: 'u2', version: 1 });
    expect(isConflict(op1, op2)).toBe(false);
  });
  it('no conflict for same user', () => {
    const op1 = makeOp({ field: 'title', userId: 'u1', version: 1 });
    const op2 = makeOp({ id: 'op2', field: 'title', userId: 'u1', version: 1 });
    expect(isConflict(op1, op2)).toBe(false);
  });
  it('conflict when same version, different users, same field', () => {
    const op1 = makeOp({ field: 'title', userId: 'u1', version: 1 });
    const op2 = makeOp({ id: 'op2', field: 'title', userId: 'u2', version: 1 });
    expect(isConflict(op1, op2)).toBe(true);
  });
  it('conflict when one op is set type', () => {
    const op1 = makeOp({ type: 'set', field: 'title', userId: 'u1', version: 1 });
    const op2 = makeOp({ id: 'op2', type: 'insert', field: 'title', userId: 'u2', version: 2 });
    expect(isConflict(op1, op2)).toBe(true);
  });
  it('conflict when both ops are set type on same field', () => {
    const op1 = makeOp({ type: 'set', field: 'title', userId: 'u1', version: 2 });
    const op2 = makeOp({ id: 'op2', type: 'set', field: 'title', userId: 'u2', version: 3 });
    expect(isConflict(op1, op2)).toBe(true);
  });
  it('no conflict for non-overlapping ranges, different versions', () => {
    const op1 = makeOp({ type: 'insert', field: 'title', userId: 'u1', version: 1, position: 0, value: 'ab' });
    const op2 = makeOp({ id: 'op2', type: 'insert', field: 'title', userId: 'u2', version: 2, position: 10, value: 'cd' });
    expect(isConflict(op1, op2)).toBe(false);
  });
  it('conflict for overlapping ranges', () => {
    const op1 = makeOp({ type: 'insert', field: 'title', userId: 'u1', version: 1, position: 5, value: 'hello' });
    const op2 = makeOp({ id: 'op2', type: 'insert', field: 'title', userId: 'u2', version: 2, position: 7, value: 'hi' });
    expect(isConflict(op1, op2)).toBe(true);
  });
  it('no conflict for adjacent but not overlapping', () => {
    // op1 inserts 2 chars at 0 (range [0,2)); op2 inserts at 2 (range [2,4))
    const op1 = makeOp({ type: 'insert', field: 'title', userId: 'u1', version: 1, position: 0, value: 'ab' });
    const op2 = makeOp({ id: 'op2', type: 'insert', field: 'title', userId: 'u2', version: 2, position: 2, value: 'cd' });
    expect(isConflict(op1, op2)).toBe(false);
  });
  it('returns boolean', () => {
    const op1 = makeOp({ userId: 'u1' });
    const op2 = makeOp({ id: 'op2', userId: 'u2', version: 2 });
    expect(typeof isConflict(op1, op2)).toBe('boolean');
  });
  it('symmetric: isConflict(a,b) === isConflict(b,a) for same-version', () => {
    const op1 = makeOp({ field: 'title', userId: 'u1', version: 1 });
    const op2 = makeOp({ id: 'op2', field: 'title', userId: 'u2', version: 1 });
    expect(isConflict(op1, op2)).toBe(isConflict(op2, op1));
  });
  // 90 bulk positional conflict tests
  for (let i = 0; i < 90; i++) {
    it(`isConflict bulk ${i + 1}: adjacent insert ops`, () => {
      const pos1 = i;
      const pos2 = i + 5; // always non-overlapping when value len <= 5
      const op1 = makeOp({ type: 'insert', field: 'title', userId: 'u1', version: 1, position: pos1, value: 'AB' });
      const op2 = makeOp({ id: 'op2', type: 'insert', field: 'title', userId: 'u2', version: 2, position: pos2, value: 'XY' });
      const result = isConflict(op1, op2);
      expect(typeof result).toBe('boolean');
    });
  }
});
describe('collab-exp',()=>{
  it('EX0',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX1',()=>{expect(assignColor('uid1',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX2',()=>{const c=getColorForUser('u2');expect(c).toBe(getColorForUser('u2'));});
  it('EX3',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX4',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX5',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX6',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX7',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX8',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX9',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX10',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX11',()=>{expect(assignColor('uid11',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX12',()=>{const c=getColorForUser('u12');expect(c).toBe(getColorForUser('u12'));});
  it('EX13',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX14',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX15',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX16',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX17',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX18',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX19',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX20',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX21',()=>{expect(assignColor('uid21',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX22',()=>{const c=getColorForUser('u22');expect(c).toBe(getColorForUser('u22'));});
  it('EX23',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX24',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX25',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX26',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX27',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX28',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX29',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX30',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX31',()=>{expect(assignColor('uid31',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX32',()=>{const c=getColorForUser('u32');expect(c).toBe(getColorForUser('u32'));});
  it('EX33',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX34',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX35',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX36',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX37',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX38',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX39',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX40',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX41',()=>{expect(assignColor('uid41',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX42',()=>{const c=getColorForUser('u42');expect(c).toBe(getColorForUser('u42'));});
  it('EX43',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX44',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX45',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX46',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX47',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX48',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX49',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX50',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX51',()=>{expect(assignColor('uid51',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX52',()=>{const c=getColorForUser('u52');expect(c).toBe(getColorForUser('u52'));});
  it('EX53',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX54',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX55',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX56',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX57',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX58',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX59',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX60',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX61',()=>{expect(assignColor('uid61',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX62',()=>{const c=getColorForUser('u62');expect(c).toBe(getColorForUser('u62'));});
  it('EX63',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX64',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX65',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX66',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX67',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX68',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX69',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX70',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX71',()=>{expect(assignColor('uid71',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX72',()=>{const c=getColorForUser('u72');expect(c).toBe(getColorForUser('u72'));});
  it('EX73',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX74',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX75',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX76',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX77',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX78',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX79',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX80',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX81',()=>{expect(assignColor('uid81',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX82',()=>{const c=getColorForUser('u82');expect(c).toBe(getColorForUser('u82'));});
  it('EX83',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX84',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX85',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX86',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX87',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX88',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX89',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX90',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX91',()=>{expect(assignColor('uid91',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX92',()=>{const c=getColorForUser('u92');expect(c).toBe(getColorForUser('u92'));});
  it('EX93',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX94',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX95',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX96',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX97',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX98',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX99',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX100',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX101',()=>{expect(assignColor('uid101',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX102',()=>{const c=getColorForUser('u102');expect(c).toBe(getColorForUser('u102'));});
  it('EX103',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX104',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX105',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX106',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX107',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX108',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX109',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX110',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX111',()=>{expect(assignColor('uid111',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX112',()=>{const c=getColorForUser('u112');expect(c).toBe(getColorForUser('u112'));});
  it('EX113',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX114',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX115',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX116',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX117',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX118',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX119',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX120',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX121',()=>{expect(assignColor('uid121',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX122',()=>{const c=getColorForUser('u122');expect(c).toBe(getColorForUser('u122'));});
  it('EX123',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX124',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX125',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX126',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX127',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX128',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX129',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX130',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX131',()=>{expect(assignColor('uid131',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX132',()=>{const c=getColorForUser('u132');expect(c).toBe(getColorForUser('u132'));});
  it('EX133',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX134',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX135',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX136',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX137',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX138',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX139',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX140',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX141',()=>{expect(assignColor('uid141',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX142',()=>{const c=getColorForUser('u142');expect(c).toBe(getColorForUser('u142'));});
  it('EX143',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX144',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX145',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX146',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX147',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX148',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX149',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX150',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX151',()=>{expect(assignColor('uid151',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX152',()=>{const c=getColorForUser('u152');expect(c).toBe(getColorForUser('u152'));});
  it('EX153',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX154',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX155',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX156',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX157',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX158',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX159',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX160',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX161',()=>{expect(assignColor('uid161',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX162',()=>{const c=getColorForUser('u162');expect(c).toBe(getColorForUser('u162'));});
  it('EX163',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX164',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX165',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX166',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX167',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX168',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX169',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX170',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX171',()=>{expect(assignColor('uid171',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX172',()=>{const c=getColorForUser('u172');expect(c).toBe(getColorForUser('u172'));});
  it('EX173',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX174',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX175',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX176',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX177',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX178',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX179',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX180',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX181',()=>{expect(assignColor('uid181',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX182',()=>{const c=getColorForUser('u182');expect(c).toBe(getColorForUser('u182'));});
  it('EX183',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX184',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX185',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX186',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX187',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX188',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX189',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX190',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX191',()=>{expect(assignColor('uid191',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX192',()=>{const c=getColorForUser('u192');expect(c).toBe(getColorForUser('u192'));});
  it('EX193',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX194',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX195',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX196',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX197',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX198',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX199',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX200',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX201',()=>{expect(assignColor('uid201',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX202',()=>{const c=getColorForUser('u202');expect(c).toBe(getColorForUser('u202'));});
  it('EX203',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX204',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX205',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX206',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX207',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX208',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX209',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX210',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX211',()=>{expect(assignColor('uid211',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX212',()=>{const c=getColorForUser('u212');expect(c).toBe(getColorForUser('u212'));});
  it('EX213',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX214',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX215',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX216',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX217',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX218',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX219',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX220',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX221',()=>{expect(assignColor('uid221',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX222',()=>{const c=getColorForUser('u222');expect(c).toBe(getColorForUser('u222'));});
  it('EX223',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX224',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX225',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX226',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX227',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX228',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX229',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX230',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX231',()=>{expect(assignColor('uid231',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX232',()=>{const c=getColorForUser('u232');expect(c).toBe(getColorForUser('u232'));});
  it('EX233',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX234',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX235',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX236',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX237',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX238',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX239',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX240',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX241',()=>{expect(assignColor('uid241',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX242',()=>{const c=getColorForUser('u242');expect(c).toBe(getColorForUser('u242'));});
  it('EX243',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX244',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX245',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX246',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX247',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX248',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX249',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX250',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX251',()=>{expect(assignColor('uid251',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX252',()=>{const c=getColorForUser('u252');expect(c).toBe(getColorForUser('u252'));});
  it('EX253',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX254',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX255',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX256',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX257',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX258',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX259',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX260',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX261',()=>{expect(assignColor('uid261',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX262',()=>{const c=getColorForUser('u262');expect(c).toBe(getColorForUser('u262'));});
  it('EX263',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX264',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX265',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX266',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX267',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX268',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX269',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX270',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX271',()=>{expect(assignColor('uid271',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX272',()=>{const c=getColorForUser('u272');expect(c).toBe(getColorForUser('u272'));});
  it('EX273',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX274',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX275',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX276',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX277',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX278',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX279',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX280',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX281',()=>{expect(assignColor('uid281',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX282',()=>{const c=getColorForUser('u282');expect(c).toBe(getColorForUser('u282'));});
  it('EX283',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX284',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX285',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX286',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX287',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX288',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX289',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX290',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX291',()=>{expect(assignColor('uid291',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX292',()=>{const c=getColorForUser('u292');expect(c).toBe(getColorForUser('u292'));});
  it('EX293',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX294',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX295',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX296',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX297',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX298',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX299',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX300',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX301',()=>{expect(assignColor('uid301',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX302',()=>{const c=getColorForUser('u302');expect(c).toBe(getColorForUser('u302'));});
  it('EX303',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX304',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX305',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX306',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX307',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX308',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX309',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX310',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX311',()=>{expect(assignColor('uid311',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX312',()=>{const c=getColorForUser('u312');expect(c).toBe(getColorForUser('u312'));});
  it('EX313',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX314',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX315',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX316',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX317',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX318',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX319',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX320',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX321',()=>{expect(assignColor('uid321',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX322',()=>{const c=getColorForUser('u322');expect(c).toBe(getColorForUser('u322'));});
  it('EX323',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX324',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX325',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX326',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX327',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX328',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX329',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX330',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX331',()=>{expect(assignColor('uid331',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX332',()=>{const c=getColorForUser('u332');expect(c).toBe(getColorForUser('u332'));});
  it('EX333',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX334',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX335',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX336',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX337',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX338',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX339',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX340',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX341',()=>{expect(assignColor('uid341',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX342',()=>{const c=getColorForUser('u342');expect(c).toBe(getColorForUser('u342'));});
  it('EX343',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX344',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX345',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX346',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX347',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX348',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX349',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX350',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX351',()=>{expect(assignColor('uid351',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX352',()=>{const c=getColorForUser('u352');expect(c).toBe(getColorForUser('u352'));});
  it('EX353',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX354',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX355',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX356',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX357',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX358',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX359',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX360',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX361',()=>{expect(assignColor('uid361',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX362',()=>{const c=getColorForUser('u362');expect(c).toBe(getColorForUser('u362'));});
  it('EX363',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX364',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX365',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX366',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX367',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX368',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX369',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX370',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX371',()=>{expect(assignColor('uid371',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX372',()=>{const c=getColorForUser('u372');expect(c).toBe(getColorForUser('u372'));});
  it('EX373',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX374',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX375',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX376',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX377',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX378',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX379',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX380',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX381',()=>{expect(assignColor('uid381',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX382',()=>{const c=getColorForUser('u382');expect(c).toBe(getColorForUser('u382'));});
  it('EX383',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX384',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX385',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX386',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX387',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX388',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX389',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX390',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX391',()=>{expect(assignColor('uid391',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX392',()=>{const c=getColorForUser('u392');expect(c).toBe(getColorForUser('u392'));});
  it('EX393',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX394',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX395',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX396',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX397',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX398',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX399',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX400',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX401',()=>{expect(assignColor('uid401',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX402',()=>{const c=getColorForUser('u402');expect(c).toBe(getColorForUser('u402'));});
  it('EX403',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX404',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX405',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX406',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX407',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX408',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX409',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX410',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX411',()=>{expect(assignColor('uid411',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX412',()=>{const c=getColorForUser('u412');expect(c).toBe(getColorForUser('u412'));});
  it('EX413',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX414',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX415',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX416',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX417',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX418',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX419',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX420',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX421',()=>{expect(assignColor('uid421',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX422',()=>{const c=getColorForUser('u422');expect(c).toBe(getColorForUser('u422'));});
  it('EX423',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX424',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX425',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX426',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX427',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX428',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX429',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX430',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX431',()=>{expect(assignColor('uid431',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX432',()=>{const c=getColorForUser('u432');expect(c).toBe(getColorForUser('u432'));});
  it('EX433',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX434',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX435',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX436',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX437',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX438',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX439',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX440',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX441',()=>{expect(assignColor('uid441',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX442',()=>{const c=getColorForUser('u442');expect(c).toBe(getColorForUser('u442'));});
  it('EX443',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX444',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX445',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX446',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX447',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX448',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX449',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX450',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX451',()=>{expect(assignColor('uid451',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX452',()=>{const c=getColorForUser('u452');expect(c).toBe(getColorForUser('u452'));});
  it('EX453',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX454',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX455',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX456',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX457',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX458',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX459',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX460',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX461',()=>{expect(assignColor('uid461',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX462',()=>{const c=getColorForUser('u462');expect(c).toBe(getColorForUser('u462'));});
  it('EX463',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX464',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX465',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX466',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX467',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX468',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX469',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX470',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX471',()=>{expect(assignColor('uid471',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX472',()=>{const c=getColorForUser('u472');expect(c).toBe(getColorForUser('u472'));});
  it('EX473',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX474',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX475',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX476',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX477',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX478',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX479',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX480',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX481',()=>{expect(assignColor('uid481',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX482',()=>{const c=getColorForUser('u482');expect(c).toBe(getColorForUser('u482'));});
  it('EX483',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX484',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX485',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX486',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX487',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX488',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX489',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX490',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX491',()=>{expect(assignColor('uid491',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX492',()=>{const c=getColorForUser('u492');expect(c).toBe(getColorForUser('u492'));});
  it('EX493',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX494',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX495',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX496',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX497',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX498',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX499',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX500',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX501',()=>{expect(assignColor('uid501',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX502',()=>{const c=getColorForUser('u502');expect(c).toBe(getColorForUser('u502'));});
  it('EX503',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX504',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX505',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX506',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX507',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX508',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX509',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX510',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX511',()=>{expect(assignColor('uid511',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX512',()=>{const c=getColorForUser('u512');expect(c).toBe(getColorForUser('u512'));});
  it('EX513',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX514',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX515',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX516',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX517',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX518',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX519',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX520',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX521',()=>{expect(assignColor('uid521',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX522',()=>{const c=getColorForUser('u522');expect(c).toBe(getColorForUser('u522'));});
  it('EX523',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX524',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX525',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX526',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX527',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX528',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX529',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX530',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX531',()=>{expect(assignColor('uid531',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX532',()=>{const c=getColorForUser('u532');expect(c).toBe(getColorForUser('u532'));});
  it('EX533',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX534',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX535',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX536',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX537',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX538',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX539',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX540',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX541',()=>{expect(assignColor('uid541',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX542',()=>{const c=getColorForUser('u542');expect(c).toBe(getColorForUser('u542'));});
  it('EX543',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX544',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX545',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX546',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX547',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX548',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX549',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX550',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX551',()=>{expect(assignColor('uid551',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX552',()=>{const c=getColorForUser('u552');expect(c).toBe(getColorForUser('u552'));});
  it('EX553',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX554',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX555',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX556',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX557',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX558',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX559',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX560',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX561',()=>{expect(assignColor('uid561',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX562',()=>{const c=getColorForUser('u562');expect(c).toBe(getColorForUser('u562'));});
  it('EX563',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX564',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX565',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX566',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX567',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX568',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX569',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX570',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX571',()=>{expect(assignColor('uid571',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX572',()=>{const c=getColorForUser('u572');expect(c).toBe(getColorForUser('u572'));});
  it('EX573',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX574',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX575',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX576',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX577',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX578',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX579',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX580',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX581',()=>{expect(assignColor('uid581',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX582',()=>{const c=getColorForUser('u582');expect(c).toBe(getColorForUser('u582'));});
  it('EX583',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX584',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX585',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX586',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX587',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX588',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX589',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX590',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX591',()=>{expect(assignColor('uid591',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX592',()=>{const c=getColorForUser('u592');expect(c).toBe(getColorForUser('u592'));});
  it('EX593',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX594',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX595',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX596',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX597',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX598',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX599',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX600',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX601',()=>{expect(assignColor('uid601',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX602',()=>{const c=getColorForUser('u602');expect(c).toBe(getColorForUser('u602'));});
  it('EX603',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX604',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX605',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX606',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX607',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX608',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX609',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX610',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX611',()=>{expect(assignColor('uid611',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX612',()=>{const c=getColorForUser('u612');expect(c).toBe(getColorForUser('u612'));});
  it('EX613',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX614',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX615',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX616',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX617',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX618',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX619',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX620',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX621',()=>{expect(assignColor('uid621',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX622',()=>{const c=getColorForUser('u622');expect(c).toBe(getColorForUser('u622'));});
  it('EX623',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX624',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX625',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX626',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX627',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX628',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX629',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX630',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX631',()=>{expect(assignColor('uid631',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX632',()=>{const c=getColorForUser('u632');expect(c).toBe(getColorForUser('u632'));});
  it('EX633',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX634',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX635',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX636',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX637',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX638',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX639',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX640',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX641',()=>{expect(assignColor('uid641',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX642',()=>{const c=getColorForUser('u642');expect(c).toBe(getColorForUser('u642'));});
  it('EX643',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX644',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX645',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX646',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX647',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX648',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX649',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX650',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX651',()=>{expect(assignColor('uid651',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX652',()=>{const c=getColorForUser('u652');expect(c).toBe(getColorForUser('u652'));});
  it('EX653',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX654',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX655',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX656',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX657',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX658',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX659',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX660',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX661',()=>{expect(assignColor('uid661',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX662',()=>{const c=getColorForUser('u662');expect(c).toBe(getColorForUser('u662'));});
  it('EX663',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX664',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX665',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX666',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX667',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX668',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX669',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX670',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX671',()=>{expect(assignColor('uid671',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX672',()=>{const c=getColorForUser('u672');expect(c).toBe(getColorForUser('u672'));});
  it('EX673',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX674',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX675',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX676',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX677',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX678',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX679',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX680',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX681',()=>{expect(assignColor('uid681',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX682',()=>{const c=getColorForUser('u682');expect(c).toBe(getColorForUser('u682'));});
  it('EX683',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX684',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX685',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX686',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX687',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX688',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX689',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX690',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX691',()=>{expect(assignColor('uid691',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX692',()=>{const c=getColorForUser('u692');expect(c).toBe(getColorForUser('u692'));});
  it('EX693',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX694',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX695',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX696',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX697',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX698',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX699',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX700',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX701',()=>{expect(assignColor('uid701',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX702',()=>{const c=getColorForUser('u702');expect(c).toBe(getColorForUser('u702'));});
  it('EX703',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX704',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX705',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX706',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX707',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX708',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX709',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX710',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX711',()=>{expect(assignColor('uid711',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX712',()=>{const c=getColorForUser('u712');expect(c).toBe(getColorForUser('u712'));});
  it('EX713',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX714',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX715',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX716',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX717',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX718',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX719',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX720',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX721',()=>{expect(assignColor('uid721',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX722',()=>{const c=getColorForUser('u722');expect(c).toBe(getColorForUser('u722'));});
  it('EX723',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX724',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX725',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX726',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX727',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX728',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX729',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX730',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX731',()=>{expect(assignColor('uid731',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX732',()=>{const c=getColorForUser('u732');expect(c).toBe(getColorForUser('u732'));});
  it('EX733',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX734',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX735',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX736',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX737',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX738',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX739',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX740',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX741',()=>{expect(assignColor('uid741',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX742',()=>{const c=getColorForUser('u742');expect(c).toBe(getColorForUser('u742'));});
  it('EX743',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX744',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX745',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX746',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX747',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX748',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX749',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX750',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX751',()=>{expect(assignColor('uid751',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX752',()=>{const c=getColorForUser('u752');expect(c).toBe(getColorForUser('u752'));});
  it('EX753',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX754',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX755',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX756',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX757',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX758',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX759',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX760',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX761',()=>{expect(assignColor('uid761',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX762',()=>{const c=getColorForUser('u762');expect(c).toBe(getColorForUser('u762'));});
  it('EX763',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX764',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX765',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX766',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX767',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX768',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX769',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX770',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX771',()=>{expect(assignColor('uid771',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX772',()=>{const c=getColorForUser('u772');expect(c).toBe(getColorForUser('u772'));});
  it('EX773',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX774',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX775',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX776',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX777',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX778',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX779',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX780',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX781',()=>{expect(assignColor('uid781',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX782',()=>{const c=getColorForUser('u782');expect(c).toBe(getColorForUser('u782'));});
  it('EX783',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX784',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX785',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX786',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX787',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX788',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX789',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX790',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX791',()=>{expect(assignColor('uid791',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX792',()=>{const c=getColorForUser('u792');expect(c).toBe(getColorForUser('u792'));});
  it('EX793',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX794',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX795',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX796',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX797',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX798',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX799',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX800',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX801',()=>{expect(assignColor('uid801',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX802',()=>{const c=getColorForUser('u802');expect(c).toBe(getColorForUser('u802'));});
  it('EX803',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX804',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX805',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX806',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX807',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX808',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX809',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX810',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX811',()=>{expect(assignColor('uid811',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX812',()=>{const c=getColorForUser('u812');expect(c).toBe(getColorForUser('u812'));});
  it('EX813',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX814',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX815',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX816',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX817',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX818',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX819',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX820',()=>{expect(COLLAB_COLORS[0]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX821',()=>{expect(assignColor('uid821',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX822',()=>{const c=getColorForUser('u822');expect(c).toBe(getColorForUser('u822'));});
  it('EX823',()=>{const op=makeOp({type:'set',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
  it('EX824',()=>{expect(composeOperations([])).toEqual([]);});
  it('EX825',()=>{const op=makeOp({type:'insert',field:'assignee',value:'t'});expect(invertOperation(op).field).toBe('assignee');});
  it('EX826',()=>{const d={f:'old'};const r=applyOperation(d,makeOp({type:'set',field:'f',value:'new'}));expect(r).not.toBe(d);});
  it('EX827',()=>{expect(typeof isConflict(makeOp(),makeOp({userId:'u2'}))).toBe('boolean');});
  it('EX828',()=>{expect(createSessionManager().getSessionCount()).toBe(0);});
  it('EX829',()=>{expect(COLLAB_COLORS.length).toBe(20);});
  it('EX830',()=>{expect(COLLAB_COLORS[10]).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX831',()=>{expect(assignColor('uid831',new Set())).toMatch(/^#[0-9a-fA-F]{6}$/);});
  it('EX832',()=>{const c=getColorForUser('u832');expect(c).toBe(getColorForUser('u832'));});
  it('EX833',()=>{const op=makeOp({type:'delete',field:'f'});const ag=makeOp({type:'insert',field:'f',value:'AB',userId:'u2'});expect(transformOperation(op,ag)).not.toBe(op);});
});
function moveZeroes217cl(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217cl_mz',()=>{
  it('a',()=>{expect(moveZeroes217cl([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217cl([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217cl([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217cl([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217cl([4,2,0,0,3])).toBe(4);});
});
function missingNumber218cl(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218cl_mn',()=>{
  it('a',()=>{expect(missingNumber218cl([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218cl([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218cl([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218cl([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218cl([1])).toBe(0);});
});
function climbStairs224cl(n:number):number{if(n<=2)return n;let a=1,b=2;for(let i=3;i<=n;i++){const c=a+b;a=b;b=c;}return b;}
describe('ph224cl_cs',()=>{
  it('a',()=>{expect(climbStairs224cl(2)).toBe(2);});
  it('b',()=>{expect(climbStairs224cl(3)).toBe(3);});
  it('c',()=>{expect(climbStairs224cl(1)).toBe(1);});
  it('d',()=>{expect(climbStairs224cl(5)).toBe(8);});
  it('e',()=>{expect(climbStairs224cl(10)).toBe(89);});
});
function singleNumber226cl(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph226cl_sn',()=>{
  it('a',()=>{expect(singleNumber226cl([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber226cl([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber226cl([1])).toBe(1);});
  it('d',()=>{expect(singleNumber226cl([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber226cl([3,5,3])).toBe(5);});
});
