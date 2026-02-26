import { AuditAction, AuditCategory, AuditChain, AuditEntry, AuditFilter, ChainVerificationResult } from './types';

export function simpleHash(data: string): string {
  let h = 5381;
  for (let i = 0; i < data.length; i++) {
    h = ((h << 5) + h) ^ data.charCodeAt(i);
    h = h >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function computeEntryHash(
  sequence: number,
  action: string,
  userId: string,
  resourceType: string,
  resourceId: string,
  timestamp: string,
  previousHash: string
): string {
  const payload = `${sequence}:${action}:${userId}:${resourceType}:${resourceId}:${timestamp}:${previousHash}`;
  return simpleHash(payload);
}

export const GENESIS_HASH = '00000000';

export function createChain(): AuditChain {
  return { entries: [], headHash: GENESIS_HASH, length: 0, createdAt: new Date().toISOString() };
}

export function appendEntry(
  chain: AuditChain,
  action: AuditAction,
  category: AuditCategory,
  userId: string,
  resourceType: string,
  resourceId: string,
  metadata?: Record<string, unknown>
): { chain: AuditChain; entry: AuditEntry } {
  const sequence = chain.length + 1;
  const timestamp = new Date().toISOString();
  const previousHash = chain.headHash;
  const hash = computeEntryHash(sequence, action, userId, resourceType, resourceId, timestamp, previousHash);
  const id = `${sequence.toString().padStart(8, '0')}-${hash}`;
  const entry: AuditEntry = { id, sequence, action, category, userId, resourceType, resourceId, previousHash, hash, timestamp, metadata };
  const newChain: AuditChain = {
    entries: [...chain.entries, entry],
    headHash: hash,
    length: chain.length + 1,
    createdAt: chain.createdAt,
  };
  return { chain: newChain, entry };
}

export function verifyChain(chain: AuditChain): ChainVerificationResult {
  const errors: string[] = [];
  let firstInvalidIndex: number | null = null;

  for (let i = 0; i < chain.entries.length; i++) {
    const entry = chain.entries[i];
    const expectedPrevHash = i === 0 ? GENESIS_HASH : chain.entries[i - 1].hash;

    if (entry.previousHash !== expectedPrevHash) {
      if (firstInvalidIndex === null) firstInvalidIndex = i;
      errors.push(`Entry ${i} (seq ${entry.sequence}): previousHash mismatch`);
    }

    if (entry.sequence !== i + 1) {
      if (firstInvalidIndex === null) firstInvalidIndex = i;
      errors.push(`Entry ${i}: sequence mismatch (expected ${i + 1}, got ${entry.sequence})`);
    }

    const recomputed = computeEntryHash(
      entry.sequence, entry.action, entry.userId,
      entry.resourceType, entry.resourceId, entry.timestamp, entry.previousHash
    );
    if (recomputed !== entry.hash) {
      if (firstInvalidIndex === null) firstInvalidIndex = i;
      errors.push(`Entry ${i} (seq ${entry.sequence}): hash tampered`);
    }
  }

  if (chain.entries.length > 0) {
    const lastHash = chain.entries[chain.entries.length - 1].hash;
    if (chain.headHash !== lastHash) {
      errors.push('Chain headHash does not match last entry hash');
    }
  }

  return {
    valid: errors.length === 0,
    checkedEntries: chain.entries.length,
    firstInvalidIndex,
    errors,
  };
}

export function filterEntries(chain: AuditChain, filter: AuditFilter): AuditEntry[] {
  return chain.entries.filter((e) => {
    if (filter.userId && e.userId !== filter.userId) return false;
    if (filter.action && e.action !== filter.action) return false;
    if (filter.category && e.category !== filter.category) return false;
    if (filter.resourceType && e.resourceType !== filter.resourceType) return false;
    if (filter.fromTimestamp && e.timestamp < filter.fromTimestamp) return false;
    if (filter.toTimestamp && e.timestamp > filter.toTimestamp) return false;
    return true;
  });
}

export function getEntryBySequence(chain: AuditChain, sequence: number): AuditEntry | undefined {
  return chain.entries.find((e) => e.sequence === sequence);
}

export function getEntriesByUser(chain: AuditChain, userId: string): AuditEntry[] {
  return chain.entries.filter((e) => e.userId === userId);
}

export function getEntriesByAction(chain: AuditChain, action: AuditAction): AuditEntry[] {
  return chain.entries.filter((e) => e.action === action);
}

export function getChainSummary(chain: AuditChain): {
  length: number;
  headHash: string;
  uniqueUsers: number;
  actionCounts: Partial<Record<AuditAction, number>>;
} {
  const users = new Set(chain.entries.map((e) => e.userId));
  const actionCounts: Partial<Record<AuditAction, number>> = {};
  for (const e of chain.entries) {
    actionCounts[e.action] = (actionCounts[e.action] ?? 0) + 1;
  }
  return { length: chain.length, headHash: chain.headHash, uniqueUsers: users.size, actionCounts };
}

export function isValidAction(action: string): action is AuditAction {
  return ['CREATE','READ','UPDATE','DELETE','LOGIN','LOGOUT','EXPORT','IMPORT','APPROVE','REJECT','SIGN','ARCHIVE'].includes(action);
}

export function isValidCategory(cat: string): cat is AuditCategory {
  return ['auth','data','document','user','system','compliance','financial'].includes(cat);
}

export function sliceChain(chain: AuditChain, from: number, to: number): AuditEntry[] {
  return chain.entries.slice(from, to);
}

export function chainToJson(chain: AuditChain): string {
  return JSON.stringify(chain);
}

export function cloneChain(chain: AuditChain): AuditChain {
  return JSON.parse(JSON.stringify(chain)) as AuditChain;
}
