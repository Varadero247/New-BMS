import { createHash } from 'crypto';
import type { ChangeDetail } from './types';

/**
 * Compute a SHA-256 checksum for an audit entry.
 * Used for 21 CFR Part 11 tamper detection.
 */
export function computeAuditChecksum(params: {
  userId: string;
  action: string;
  resourceId: string;
  timestamp: Date;
  changes: ChangeDetail[];
}): string {
  const payload = JSON.stringify({
    userId: params.userId,
    action: params.action,
    resourceId: params.resourceId,
    timestamp: params.timestamp.toISOString(),
    changes: params.changes,
  });

  return createHash('sha256').update(payload).digest('hex');
}

/**
 * Verify an audit entry checksum matches the stored value.
 */
export function verifyAuditChecksum(params: {
  userId: string;
  action: string;
  resourceId: string;
  timestamp: Date;
  changes: ChangeDetail[];
  storedChecksum: string;
}): boolean {
  const computed = computeAuditChecksum({
    userId: params.userId,
    action: params.action,
    resourceId: params.resourceId,
    timestamp: params.timestamp,
    changes: params.changes,
  });

  return computed === params.storedChecksum;
}

/**
 * Compute a SHA-256 checksum for an electronic signature.
 */
export function computeSignatureChecksum(params: {
  userId: string;
  meaning: string;
  resourceType: string;
  resourceId: string;
  timestamp: Date;
}): string {
  const payload = JSON.stringify({
    userId: params.userId,
    meaning: params.meaning,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    timestamp: params.timestamp.toISOString(),
  });

  return createHash('sha256').update(payload).digest('hex');
}

/**
 * Verify a signature checksum matches the stored value.
 */
export function verifySignatureChecksum(params: {
  userId: string;
  meaning: string;
  resourceType: string;
  resourceId: string;
  timestamp: Date;
  storedChecksum: string;
}): boolean {
  const computed = computeSignatureChecksum({
    userId: params.userId,
    meaning: params.meaning,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    timestamp: params.timestamp,
  });

  return computed === params.storedChecksum;
}

/**
 * Compute field-level diff between old and new data objects.
 */
export function computeChanges(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
): ChangeDetail[] {
  const changes: ChangeDetail[] = [];
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

  for (const key of allKeys) {
    const oldVal = oldData[key];
    const newVal = newData[key];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({
        field: key,
        oldValue: oldVal ?? null,
        newValue: newVal ?? null,
      });
    }
  }

  return changes;
}
