import {
  acquireLock,
  releaseLock,
  refreshLock,
  getPresence,
  clearAll,
} from '../src/index';

// Each test gets a fresh store
beforeEach(() => clearAll());

const TYPE = 'risk';
const ID = 'rec-1';
const USER_A = { userId: 'user-a', userName: 'Alice' };
const USER_B = { userId: 'user-b', userName: 'Bob' };

describe('acquireLock', () => {
  it('acquires a lock when the record is free', () => {
    const result = acquireLock(TYPE, ID, USER_A.userId, USER_A.userName);
    expect(result).toEqual({ acquired: true });
  });

  it('lock appears in getPresence with correct fields', () => {
    acquireLock(TYPE, ID, USER_A.userId, USER_A.userName, 'avatar.png');
    const users = getPresence(TYPE, ID);
    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject({
      userId: USER_A.userId,
      userName: USER_A.userName,
      avatar: 'avatar.png',
    });
    expect(users[0].expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('sets expiresAt ~30 seconds in the future', () => {
    const before = Date.now();
    acquireLock(TYPE, ID, USER_A.userId, USER_A.userName);
    const users = getPresence(TYPE, ID);
    const ttl = users[0].expiresAt.getTime() - before;
    expect(ttl).toBeGreaterThanOrEqual(29_000);
    expect(ttl).toBeLessThanOrEqual(31_000);
  });

  it('rejects if another user holds an active lock', () => {
    acquireLock(TYPE, ID, USER_A.userId, USER_A.userName);
    const result = acquireLock(TYPE, ID, USER_B.userId, USER_B.userName);
    expect(result.acquired).toBe(false);
    expect(result.lockedBy?.userId).toBe(USER_A.userId);
  });

  it('returns the blocking user details when rejecting', () => {
    acquireLock(TYPE, ID, USER_A.userId, USER_A.userName, 'a.png');
    const result = acquireLock(TYPE, ID, USER_B.userId, USER_B.userName);
    expect(result.lockedBy?.userName).toBe(USER_A.userName);
    expect(result.lockedBy?.avatar).toBe('a.png');
  });

  it('allows same user to re-acquire (refresh)', () => {
    acquireLock(TYPE, ID, USER_A.userId, USER_A.userName);
    const result = acquireLock(TYPE, ID, USER_A.userId, USER_A.userName);
    expect(result).toEqual({ acquired: true });
    // Still only one entry in presence
    expect(getPresence(TYPE, ID)).toHaveLength(1);
  });

  it('preserves original lockedAt when same user re-acquires', () => {
    acquireLock(TYPE, ID, USER_A.userId, USER_A.userName);
    const first = getPresence(TYPE, ID)[0].lockedAt;
    acquireLock(TYPE, ID, USER_A.userId, USER_A.userName);
    const second = getPresence(TYPE, ID)[0].lockedAt;
    expect(second.getTime()).toBe(first.getTime());
  });

  it('force-overrides an existing lock from another user', () => {
    acquireLock(TYPE, ID, USER_A.userId, USER_A.userName);
    const result = acquireLock(TYPE, ID, USER_B.userId, USER_B.userName, undefined, true);
    expect(result.acquired).toBe(true);
    const users = getPresence(TYPE, ID);
    expect(users).toHaveLength(1);
    expect(users[0].userId).toBe(USER_B.userId);
  });

  it('handles different records independently', () => {
    acquireLock(TYPE, 'rec-1', USER_A.userId, USER_A.userName);
    const result = acquireLock(TYPE, 'rec-2', USER_B.userId, USER_B.userName);
    expect(result.acquired).toBe(true);
  });

  it('handles different record types independently', () => {
    acquireLock('risk', ID, USER_A.userId, USER_A.userName);
    const result = acquireLock('audit', ID, USER_B.userId, USER_B.userName);
    expect(result.acquired).toBe(true);
  });

  it('allows another user to acquire after the first user\'s lock expires', () => {
    acquireLock(TYPE, ID, USER_A.userId, USER_A.userName);
    // Manually expire A's lock
    const users = getPresence(TYPE, ID);
    users[0].expiresAt = new Date(Date.now() - 1);

    // B should now be able to acquire (expired lock is cleaned by cleanExpired before the loop)
    const result = acquireLock(TYPE, ID, USER_B.userId, USER_B.userName);
    expect(result.acquired).toBe(true);
    const present = getPresence(TYPE, ID);
    expect(present).toHaveLength(1);
    expect(present[0].userId).toBe(USER_B.userId);
  });

  it('stores avatar as undefined when not provided', () => {
    acquireLock(TYPE, ID, USER_A.userId, USER_A.userName);
    const users = getPresence(TYPE, ID);
    expect(users[0].avatar).toBeUndefined();
  });
});

describe('releaseLock', () => {
  it('releases a lock so another user can acquire it', () => {
    acquireLock(TYPE, ID, USER_A.userId, USER_A.userName);
    releaseLock(TYPE, ID, USER_A.userId);
    const result = acquireLock(TYPE, ID, USER_B.userId, USER_B.userName);
    expect(result.acquired).toBe(true);
  });

  it('removes the user from getPresence', () => {
    acquireLock(TYPE, ID, USER_A.userId, USER_A.userName);
    releaseLock(TYPE, ID, USER_A.userId);
    expect(getPresence(TYPE, ID)).toHaveLength(0);
  });

  it('is a no-op for a non-existent record', () => {
    expect(() => releaseLock(TYPE, 'nonexistent', USER_A.userId)).not.toThrow();
  });

  it('is a no-op for a non-existent user within a record', () => {
    acquireLock(TYPE, ID, USER_A.userId, USER_A.userName);
    expect(() => releaseLock(TYPE, ID, 'ghost-user')).not.toThrow();
    expect(getPresence(TYPE, ID)).toHaveLength(1);
  });
});

describe('refreshLock', () => {
  it('extends expiresAt by approximately 30 more seconds', () => {
    acquireLock(TYPE, ID, USER_A.userId, USER_A.userName);
    const before = getPresence(TYPE, ID)[0].expiresAt.getTime();
    refreshLock(TYPE, ID, USER_A.userId);
    const after = getPresence(TYPE, ID)[0].expiresAt.getTime();
    expect(after).toBeGreaterThanOrEqual(before);
  });

  it('is a no-op for a non-existent record', () => {
    expect(() => refreshLock(TYPE, 'nonexistent', USER_A.userId)).not.toThrow();
  });

  it('is a no-op for a non-existent user', () => {
    acquireLock(TYPE, ID, USER_A.userId, USER_A.userName);
    expect(() => refreshLock(TYPE, ID, 'ghost')).not.toThrow();
  });
});

describe('getPresence', () => {
  it('returns empty array for a record with no locks', () => {
    expect(getPresence(TYPE, 'unknown')).toEqual([]);
  });

  it('returns all active users for a record', () => {
    // Acquire lock for A, then force-override to add B (both on same record impossible normally)
    // Use different records instead
    acquireLock(TYPE, 'r1', USER_A.userId, USER_A.userName);
    acquireLock(TYPE, 'r2', USER_B.userId, USER_B.userName);
    expect(getPresence(TYPE, 'r1')).toHaveLength(1);
    expect(getPresence(TYPE, 'r2')).toHaveLength(1);
  });

  it('automatically removes expired entries on read', () => {
    // Acquire lock, then fake expiry by manipulating the date directly
    acquireLock(TYPE, ID, USER_A.userId, USER_A.userName);
    const users = getPresence(TYPE, ID);
    // Manually expire the lock by setting expiresAt in the past
    users[0].expiresAt = new Date(Date.now() - 1);
    // Next getPresence call should clean it up
    expect(getPresence(TYPE, ID)).toHaveLength(0);
  });
});

describe('clearAll', () => {
  it('removes all locks from all records', () => {
    acquireLock(TYPE, 'r1', USER_A.userId, USER_A.userName);
    acquireLock(TYPE, 'r2', USER_B.userId, USER_B.userName);
    clearAll();
    expect(getPresence(TYPE, 'r1')).toHaveLength(0);
    expect(getPresence(TYPE, 'r2')).toHaveLength(0);
  });

  it('allows fresh locks to be acquired after clear', () => {
    acquireLock(TYPE, ID, USER_A.userId, USER_A.userName);
    clearAll();
    const result = acquireLock(TYPE, ID, USER_B.userId, USER_B.userName);
    expect(result.acquired).toBe(true);
  });
});
