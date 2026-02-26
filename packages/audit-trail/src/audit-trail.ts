// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export interface AuditEntry {
  id: string;
  timestamp: number;
  action: string;
  userId: string;
  entityId: string;
  entityType: string;
  data: unknown;
  hash: string;
  prevHash: string;
}

let _counter = 0;

function djb2(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16);
}

export function hashEntry(entry: Omit<AuditEntry, 'hash'>): string {
  const str = `${entry.id}|${entry.timestamp}|${entry.action}|${entry.userId}|${entry.entityId}|${entry.entityType}|${JSON.stringify(entry.data)}|${entry.prevHash}`;
  return djb2(str);
}

export function createEntry(opts: {
  action: string; userId: string; entityId: string; entityType: string;
  data?: unknown; prevHash?: string;
}): AuditEntry {
  _counter++;
  const id = `entry-${String(_counter).padStart(4, '0')}`;
  const partial: Omit<AuditEntry, 'hash'> = {
    id, timestamp: Date.now(), action: opts.action, userId: opts.userId,
    entityId: opts.entityId, entityType: opts.entityType,
    data: opts.data ?? null, prevHash: opts.prevHash ?? '',
  };
  return { ...partial, hash: hashEntry(partial) };
}

export function resetCounter(): void { _counter = 0; }

export class AuditTrail {
  private entries: AuditEntry[];

  constructor(entries: AuditEntry[] = []) {
    this.entries = [...entries];
  }

  append(action: string, userId: string, entityId: string, entityType: string, data?: unknown): AuditEntry {
    const prev = this.entries[this.entries.length - 1];
    const entry = createEntry({ action, userId, entityId, entityType, data, prevHash: prev?.hash ?? '' });
    this.entries.push(entry);
    return entry;
  }

  getEntries(): AuditEntry[] { return [...this.entries]; }

  getById(id: string): AuditEntry | undefined { return this.entries.find(e => e.id === id); }

  getByEntity(entityId: string): AuditEntry[] { return this.entries.filter(e => e.entityId === entityId); }

  getByUser(userId: string): AuditEntry[] { return this.entries.filter(e => e.userId === userId); }

  getByAction(action: string): AuditEntry[] { return this.entries.filter(e => e.action === action); }

  verify(): boolean {
    for (let i = 0; i < this.entries.length; i++) {
      const e = this.entries[i];
      const { hash, ...rest } = e;
      if (hashEntry(rest) !== hash) return false;
      if (i > 0 && e.prevHash !== this.entries[i - 1].hash) return false;
    }
    return true;
  }

  get length(): number { return this.entries.length; }
  get last(): AuditEntry | undefined { return this.entries[this.entries.length - 1]; }

  toJSON(): string { return JSON.stringify(this.entries); }

  static fromJSON(json: string): AuditTrail {
    return new AuditTrail(JSON.parse(json) as AuditEntry[]);
  }
}

export function formatEntry(entry: AuditEntry): string {
  return `[${new Date(entry.timestamp).toISOString()}] ${entry.action} by ${entry.userId} on ${entry.entityType}/${entry.entityId}`;
}

export function filterByTimeRange(entries: AuditEntry[], from: Date, to: Date): AuditEntry[] {
  const f = from.getTime(), t = to.getTime();
  return entries.filter(e => e.timestamp >= f && e.timestamp <= t);
}
