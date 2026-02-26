import { AuditAction, AuditEntry, AuditSeverity, AuditSummary, FieldChange, FormattedAuditEntry } from './types';

export function diffObjects(before: Record<string, unknown>, after: Record<string, unknown>): FieldChange[] {
  const changes: FieldChange[] = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of allKeys) {
    const oldValue = before[key];
    const newValue = after[key];
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({ field: key, oldValue, newValue });
    }
  }
  return changes;
}

export function formatTimestamp(ts: number, locale = 'en-GB'): string {
  return new Date(ts).toLocaleString(locale);
}

export function formatAction(action: AuditAction): string {
  const map: Record<AuditAction, string> = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
    view: 'Viewed',
    export: 'Exported',
    login: 'Logged in',
    logout: 'Logged out',
    approve: 'Approved',
    reject: 'Rejected',
  };
  return map[action] ?? action;
}

export function formatChange(change: FieldChange): string {
  const oldStr = change.oldValue === null || change.oldValue === undefined ? '(empty)' : String(change.oldValue);
  const newStr = change.newValue === null || change.newValue === undefined ? '(empty)' : String(change.newValue);
  return change.field + ': "' + oldStr + '" \u2192 "' + newStr + '"';
}

export function formatEntry(entry: AuditEntry): FormattedAuditEntry {
  const actor = entry.userName ?? entry.userId;
  const action = formatAction(entry.action);
  const description = actor + ' ' + action + ' ' + entry.entityType + ' #' + entry.entityId;
  const details = (entry.changes ?? []).map(formatChange);
  if (entry.ipAddress) details.push('IP: ' + entry.ipAddress);
  return {
    id: entry.id,
    description,
    timestamp: formatTimestamp(entry.timestamp),
    actor,
    action,
    severity: entry.severity,
    details,
  };
}

export function formatEntries(entries: AuditEntry[]): FormattedAuditEntry[] {
  return entries.map(formatEntry);
}

export function summarise(entries: AuditEntry[]): AuditSummary {
  const byAction: Record<AuditAction, number> = {
    create: 0, update: 0, delete: 0, view: 0, export: 0,
    login: 0, logout: 0, approve: 0, reject: 0,
  };
  const bySeverity: Record<AuditSeverity, number> = { info: 0, warning: 0, critical: 0 };
  const byUser: Record<string, number> = {};

  let minTs = Infinity;
  let maxTs = -Infinity;

  for (const e of entries) {
    byAction[e.action] = (byAction[e.action] ?? 0) + 1;
    bySeverity[e.severity]++;
    byUser[e.userId] = (byUser[e.userId] ?? 0) + 1;
    if (e.timestamp < minTs) minTs = e.timestamp;
    if (e.timestamp > maxTs) maxTs = e.timestamp;
  }

  return {
    totalEntries: entries.length,
    byAction,
    bySeverity,
    byUser,
    dateRange: entries.length > 0 ? { from: minTs, to: maxTs } : null,
  };
}

export function filterByAction(entries: AuditEntry[], action: AuditAction): AuditEntry[] {
  return entries.filter(e => e.action === action);
}

export function filterBySeverity(entries: AuditEntry[], severity: AuditSeverity): AuditEntry[] {
  return entries.filter(e => e.severity === severity);
}

export function filterByUser(entries: AuditEntry[], userId: string): AuditEntry[] {
  return entries.filter(e => e.userId === userId);
}

export function filterByDateRange(entries: AuditEntry[], from: number, to: number): AuditEntry[] {
  return entries.filter(e => e.timestamp >= from && e.timestamp <= to);
}

export function sortByTimestamp(entries: AuditEntry[], direction: 'asc' | 'desc' = 'desc'): AuditEntry[] {
  return [...entries].sort((a, b) => direction === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp);
}

export function makeEntry(
  id: string, action: AuditAction, entityType: string, entityId: string,
  userId: string, severity: AuditSeverity = 'info'
): AuditEntry {
  return { id, action, entityType, entityId, userId, timestamp: Date.now(), severity };
}

export function isValidAction(a: string): a is AuditAction {
  return ['create','update','delete','view','export','login','logout','approve','reject'].includes(a);
}

export function isValidSeverity(s: string): s is AuditSeverity {
  return ['info','warning','critical'].includes(s);
}

export function changedFields(changes: FieldChange[]): string[] {
  return changes.map(c => c.field);
}

export function hasFieldChanged(changes: FieldChange[], field: string): boolean {
  return changes.some(c => c.field === field);
}

export function recentEntries(entries: AuditEntry[], count: number): AuditEntry[] {
  return sortByTimestamp(entries, 'desc').slice(0, count);
}

export function entryCount(entries: AuditEntry[], userId?: string): number {
  if (!userId) return entries.length;
  return entries.filter(e => e.userId === userId).length;
}
