import { IOCRecord, IOCType, ThreatSeverity, ThreatReport } from './types';
import { createHash, randomBytes } from 'crypto';

export class IOCManager {
  private readonly iocs = new Map<string, IOCRecord>();

  add(type: IOCType, value: string, opts: { confidence?: number; severity?: ThreatSeverity; tags?: string[]; source?: string } = {}): IOCRecord {
    const id = randomBytes(8).toString('hex');
    const now = new Date();
    const record: IOCRecord = {
      id, type, value,
      confidence: opts.confidence ?? 75,
      severity: opts.severity ?? 'MEDIUM',
      tags: opts.tags ?? [],
      source: opts.source ?? 'manual',
      firstSeen: now,
      lastSeen: now,
      hitCount: 0,
      isActive: true,
    };
    this.iocs.set(id, record);
    return record;
  }

  get(id: string): IOCRecord | undefined { return this.iocs.get(id); }

  lookup(value: string): IOCRecord[] {
    return Array.from(this.iocs.values()).filter(r => r.value === value && r.isActive);
  }

  getByType(type: IOCType): IOCRecord[] {
    return Array.from(this.iocs.values()).filter(r => r.type === type);
  }

  getBySeverity(severity: ThreatSeverity): IOCRecord[] {
    return Array.from(this.iocs.values()).filter(r => r.severity === severity);
  }

  recordHit(id: string): void {
    const r = this.iocs.get(id);
    if (r) this.iocs.set(id, { ...r, hitCount: r.hitCount + 1, lastSeen: new Date() });
  }

  deactivate(id: string): void {
    const r = this.iocs.get(id);
    if (r) this.iocs.set(id, { ...r, isActive: false });
  }

  getActive(): IOCRecord[] { return Array.from(this.iocs.values()).filter(r => r.isActive); }

  getReport(): ThreatReport {
    const all = Array.from(this.iocs.values());
    const tagCounts = new Map<string, number>();
    for (const r of all) r.tags.forEach(t => tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1));
    const topTags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]);
    return {
      iocCount: all.length,
      criticalCount: all.filter(r => r.severity === 'CRITICAL').length,
      highCount: all.filter(r => r.severity === 'HIGH').length,
      activeCount: all.filter(r => r.isActive).length,
      topTags,
    };
  }

  hashValue(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  getAll(): IOCRecord[] { return Array.from(this.iocs.values()); }
  getTotalCount(): number { return this.iocs.size; }
}
