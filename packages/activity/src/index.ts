import { createLogger } from '@ims/monitoring';

const logger = createLogger('activity');

// ============================================
// Types
// ============================================

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'commented'
  | 'assigned'
  | 'attachment_added'
  | 'ai_analysis_run'
  | 'review_completed'
  | 'deleted'
  | 'approved'
  | 'rejected';

export interface ActivityLogEntry {
  id: string;
  orgId: string;
  recordType: string;
  recordId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: ActivityAction;
  field?: string;
  oldValue?: string;
  newValue?: string;
  comment?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface LogActivityParams {
  orgId: string;
  recordType: string;
  recordId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: ActivityAction;
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
  comment?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// In-memory store
// ============================================

const MAX_ENTRIES_PER_RECORD = 1000;

/** Map keyed by "recordType:recordId" holding ordered entries (newest first) */
const store = new Map<string, ActivityLogEntry[]>();

/** Secondary index: orgId -> Set of store keys for fast org-wide queries */
const orgIndex = new Map<string, Set<string>>();

function makeKey(recordType: string, recordId: string): string {
  return `${recordType}:${recordId}`;
}

let idCounter = 0;
function generateId(): string {
  idCounter += 1;
  return `act_${Date.now()}_${idCounter}`;
}

// ============================================
// Core functions
// ============================================

/**
 * Log an activity entry. Never throws — errors are logged via @ims/monitoring.
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const key = makeKey(params.recordType, params.recordId);

    const entry: ActivityLogEntry = {
      id: generateId(),
      orgId: params.orgId,
      recordType: params.recordType,
      recordId: params.recordId,
      userId: params.userId,
      userName: params.userName,
      userAvatar: params.userAvatar,
      action: params.action,
      field: params.field,
      oldValue: stringify(params.oldValue),
      newValue: stringify(params.newValue),
      comment: params.comment,
      metadata: params.metadata,
      createdAt: new Date(),
    };

    // Append to record store
    let entries = store.get(key);
    if (!entries) {
      entries = [];
      store.set(key, entries);
    }
    // Prepend (newest first)
    entries.unshift(entry);

    // Trim to max size
    if (entries.length > MAX_ENTRIES_PER_RECORD) {
      entries.length = MAX_ENTRIES_PER_RECORD;
    }

    // Update org index
    let orgKeys = orgIndex.get(params.orgId);
    if (!orgKeys) {
      orgKeys = new Set();
      orgIndex.set(params.orgId, orgKeys);
    }
    orgKeys.add(key);

    logger.info('Activity logged', {
      action: params.action,
      recordType: params.recordType,
      recordId: params.recordId,
      userId: params.userId,
    });
  } catch (error: unknown) {
    logger.error('Failed to log activity', {
      error: error instanceof Error ? error.message : 'Unknown error',
      params: { action: params.action, recordType: params.recordType, recordId: params.recordId },
    });
  }
}

/**
 * Get paginated activity entries for a specific record, newest first.
 */
export async function getActivity(
  recordType: string,
  recordId: string,
  opts?: { limit?: number; offset?: number }
): Promise<{ entries: ActivityLogEntry[]; total: number }> {
  const key = makeKey(recordType, recordId);
  const all = store.get(key) || [];
  const limit = Math.min(opts?.limit ?? 20, 100);
  const offset = opts?.offset ?? 0;

  return {
    entries: all.slice(offset, offset + limit),
    total: all.length,
  };
}

/**
 * Get the most recent activity entries across all records for an organisation.
 */
export async function getRecentActivity(
  orgId: string,
  limit?: number
): Promise<ActivityLogEntry[]> {
  const maxEntries = Math.min(limit ?? 20, 100);
  const orgKeys = orgIndex.get(orgId);

  if (!orgKeys || orgKeys.size === 0) {
    return [];
  }

  // Collect up to maxEntries from each record's first entries, then sort
  const candidates: ActivityLogEntry[] = [];
  for (const key of orgKeys) {
    const entries = store.get(key);
    if (entries && entries.length > 0) {
      // Take at most maxEntries from each record (they're already newest-first)
      candidates.push(...entries.slice(0, maxEntries));
    }
  }

  // Sort by createdAt descending
  candidates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return candidates.slice(0, maxEntries);
}

/**
 * Clear all activity data. Useful for testing.
 */
export function clearAllActivity(): void {
  store.clear();
  orgIndex.clear();
  idCounter = 0;
}

// ============================================
// Helpers
// ============================================

function stringify(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

// Re-export middleware
export { activityLogger } from './middleware';
