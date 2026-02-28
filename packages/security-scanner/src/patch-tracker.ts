export type PatchStatus = 'PENDING' | 'TESTING' | 'APPROVED' | 'DEPLOYED' | 'FAILED' | 'DEFERRED';

export interface PatchRecord {
  id: string;
  cveId: string;
  component: string;
  currentVersion: string;
  targetVersion: string;
  status: PatchStatus;
  priority: number; // 1-5, 5=highest
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  notes: string[];
}

let _seq = 0;

export class PatchTracker {
  private readonly patches = new Map<string, PatchRecord>();

  create(cveId: string, component: string, currentVersion: string, targetVersion: string, priority = 3): PatchRecord {
    const id = `patch-${++_seq}`;
    const now = new Date();
    const patch: PatchRecord = {
      id, cveId, component, currentVersion, targetVersion,
      status: 'PENDING', priority, createdAt: now, updatedAt: now, notes: [],
    };
    this.patches.set(id, patch);
    return patch;
  }

  updateStatus(id: string, status: PatchStatus, note?: string): PatchRecord {
    const p = this.patches.get(id);
    if (!p) throw new Error(`Patch not found: ${id}`);
    const updated: PatchRecord = { ...p, status, updatedAt: new Date(), notes: note ? [...p.notes, note] : p.notes };
    this.patches.set(id, updated);
    return updated;
  }

  assign(id: string, assignee: string): void {
    const p = this.patches.get(id);
    if (p) this.patches.set(id, { ...p, assignedTo: assignee, updatedAt: new Date() });
  }

  get(id: string): PatchRecord | undefined { return this.patches.get(id); }
  getAll(): PatchRecord[] { return Array.from(this.patches.values()); }
  getByStatus(status: PatchStatus): PatchRecord[] { return Array.from(this.patches.values()).filter(p => p.status === status); }
  getByPriority(minPriority: number): PatchRecord[] { return Array.from(this.patches.values()).filter(p => p.priority >= minPriority); }
  getPending(): PatchRecord[] { return this.getByStatus('PENDING'); }
  getDeployed(): PatchRecord[] { return this.getByStatus('DEPLOYED'); }
  getCount(): number { return this.patches.size; }

  getOverdueSummary(): { pending: number; testing: number; deferred: number } {
    const all = Array.from(this.patches.values());
    return {
      pending: all.filter(p => p.status === 'PENDING').length,
      testing: all.filter(p => p.status === 'TESTING').length,
      deferred: all.filter(p => p.status === 'DEFERRED').length,
    };
  }
}
