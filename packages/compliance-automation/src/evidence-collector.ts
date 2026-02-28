import { EvidenceItem, EvidenceType } from './types';
import { createHash } from 'crypto';

let _seq = 0;

export class EvidenceCollector {
  private readonly items = new Map<string, EvidenceItem>();

  collect(
    controlId: string,
    type: EvidenceType,
    filename: string,
    description: string,
    collectedBy: string,
    content: string,
    tags: string[] = [],
  ): EvidenceItem {
    const id = `ev-${++_seq}-${Date.now()}`;
    const hash = createHash('sha256').update(content).digest('hex');
    const item: EvidenceItem = {
      id, controlId, type, filename, description,
      collectedAt: new Date(), collectedBy, hash, tags,
    };
    this.items.set(id, item);
    return item;
  }

  get(id: string): EvidenceItem | undefined {
    return this.items.get(id);
  }

  getByControl(controlId: string): EvidenceItem[] {
    return Array.from(this.items.values()).filter(e => e.controlId === controlId);
  }

  getByType(type: EvidenceType): EvidenceItem[] {
    return Array.from(this.items.values()).filter(e => e.type === type);
  }

  getByCollector(collectedBy: string): EvidenceItem[] {
    return Array.from(this.items.values()).filter(e => e.collectedBy === collectedBy);
  }

  getByTag(tag: string): EvidenceItem[] {
    return Array.from(this.items.values()).filter(e => e.tags.includes(tag));
  }

  getAll(): EvidenceItem[] {
    return Array.from(this.items.values());
  }

  getCount(): number {
    return this.items.size;
  }

  verifyIntegrity(id: string, content: string): boolean {
    const item = this.items.get(id);
    if (!item) return false;
    const hash = createHash('sha256').update(content).digest('hex');
    return hash === item.hash;
  }

  getControlCoverage(controlIds: string[]): { covered: string[]; uncovered: string[] } {
    const covered = new Set<string>();
    for (const item of this.items.values()) {
      if (controlIds.includes(item.controlId)) covered.add(item.controlId);
    }
    return {
      covered: Array.from(covered),
      uncovered: controlIds.filter(id => !covered.has(id)),
    };
  }

  getSummaryByControl(): Record<string, number> {
    const summary: Record<string, number> = {};
    for (const item of this.items.values()) {
      summary[item.controlId] = (summary[item.controlId] ?? 0) + 1;
    }
    return summary;
  }
}
