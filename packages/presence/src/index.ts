export interface PresenceUser {
  userId: string;
  userName: string;
  avatar?: string;
  lockedAt: Date;
  expiresAt: Date;
}

export interface LockResult {
  acquired: boolean;
  lockedBy?: PresenceUser;
}

// In-memory store: Map<compositeKey, Map<userId, PresenceUser>>
// Key: "{recordType}:{recordId}"
// TTL: 30 seconds per lock entry (auto-expire on read)
const LOCK_TTL_MS = 30_000;

const presenceStore = new Map<string, Map<string, PresenceUser>>();

function makeKey(recordType: string, recordId: string): string {
  return `${recordType}:${recordId}`;
}

function cleanExpired(recordMap: Map<string, PresenceUser>): void {
  const now = new Date();
  for (const [userId, user] of recordMap) {
    if (user.expiresAt <= now) {
      recordMap.delete(userId);
    }
  }
}

function getRecordMap(key: string): Map<string, PresenceUser> {
  let recordMap = presenceStore.get(key);
  if (!recordMap) {
    recordMap = new Map();
    presenceStore.set(key, recordMap);
  }
  cleanExpired(recordMap);
  return recordMap;
}

/**
 * Acquire an edit lock on a record.
 * If no other user has an active (non-expired) lock: { acquired: true }
 * If another user has lock: { acquired: false, lockedBy: ... }
 * Same user re-acquiring: refresh and return { acquired: true }
 */
export function acquireLock(
  recordType: string,
  recordId: string,
  userId: string,
  userName: string,
  avatar?: string,
  force?: boolean
): LockResult {
  const key = makeKey(recordType, recordId);
  const recordMap = getRecordMap(key);

  // Check if another user already holds a lock
  for (const [existingUserId, existingUser] of recordMap) {
    if (existingUserId !== userId && existingUser.expiresAt > new Date()) {
      if (force) {
        // Force override: remove the existing lock
        recordMap.delete(existingUserId);
        break;
      }
      return { acquired: false, lockedBy: existingUser };
    }
  }

  // Grant the lock (or refresh if same user)
  const now = new Date();
  const user: PresenceUser = {
    userId,
    userName,
    avatar,
    lockedAt: recordMap.get(userId)?.lockedAt ?? now,
    expiresAt: new Date(now.getTime() + LOCK_TTL_MS),
  };
  recordMap.set(userId, user);

  return { acquired: true };
}

/**
 * Release a user's lock on a record.
 */
export function releaseLock(recordType: string, recordId: string, userId: string): void {
  const key = makeKey(recordType, recordId);
  const recordMap = presenceStore.get(key);
  if (recordMap) {
    recordMap.delete(userId);
    if (recordMap.size === 0) {
      presenceStore.delete(key);
    }
  }
}

/**
 * Refresh (extend) a user's lock by another 30 seconds.
 */
export function refreshLock(recordType: string, recordId: string, userId: string): void {
  const key = makeKey(recordType, recordId);
  const recordMap = presenceStore.get(key);
  if (!recordMap) return;

  const user = recordMap.get(userId);
  if (user) {
    user.expiresAt = new Date(Date.now() + LOCK_TTL_MS);
  }
}

/**
 * Get all active (non-expired) users viewing a record.
 * Cleans up expired entries automatically.
 */
export function getPresence(recordType: string, recordId: string): PresenceUser[] {
  const key = makeKey(recordType, recordId);
  const recordMap = getRecordMap(key);
  return Array.from(recordMap.values());
}

/**
 * Clear the entire presence store. Useful for testing.
 */
export function clearAll(): void {
  presenceStore.clear();
}
