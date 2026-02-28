import {
  CAPARecord,
  CAPAType,
  CAPAPriority,
  CAPAStatus,
  RootCauseCategory,
  VerificationResult,
} from './types';

export class CAPAManager {
  private _store: Map<string, CAPARecord> = new Map();
  private _seq: number = 0;

  raise(
    id: string,
    title: string,
    type: CAPAType,
    priority: CAPAPriority,
    description: string,
    source: string,
    raisedBy: string,
    raisedAt: string,
  ): CAPARecord {
    const record: CAPARecord = {
      id,
      title,
      type,
      priority,
      status: 'OPEN',
      description,
      source,
      raisedBy,
      raisedAt,
    };
    this._store.set(id, record);
    this._seq++;
    return { ...record };
  }

  investigate(id: string, assignedTo: string): CAPARecord {
    const record = this._store.get(id);
    if (!record) throw new Error(`CAPA not found: ${id}`);
    record.status = 'UNDER_INVESTIGATION';
    record.assignedTo = assignedTo;
    return { ...record };
  }

  startAction(id: string, targetDate: string): CAPARecord {
    const record = this._store.get(id);
    if (!record) throw new Error(`CAPA not found: ${id}`);
    record.status = 'ACTION_IN_PROGRESS';
    record.targetDate = targetDate;
    return { ...record };
  }

  submitForVerification(id: string, rootCause: string, rootCauseCategory: RootCauseCategory): CAPARecord {
    const record = this._store.get(id);
    if (!record) throw new Error(`CAPA not found: ${id}`);
    record.status = 'VERIFICATION';
    record.rootCause = rootCause;
    record.rootCauseCategory = rootCauseCategory;
    return { ...record };
  }

  close(id: string, closedBy: string, closedAt: string, verificationResult: VerificationResult): CAPARecord {
    const record = this._store.get(id);
    if (!record) throw new Error(`CAPA not found: ${id}`);
    record.status = 'CLOSED';
    record.closedBy = closedBy;
    record.closedAt = closedAt;
    record.verificationResult = verificationResult;
    return { ...record };
  }

  cancel(id: string): CAPARecord {
    const record = this._store.get(id);
    if (!record) throw new Error(`CAPA not found: ${id}`);
    record.status = 'CANCELLED';
    return { ...record };
  }

  get(id: string): CAPARecord | undefined {
    const record = this._store.get(id);
    return record ? { ...record } : undefined;
  }

  getAll(): CAPARecord[] {
    return Array.from(this._store.values()).map(r => ({ ...r }));
  }

  getByStatus(status: CAPAStatus): CAPARecord[] {
    return Array.from(this._store.values())
      .filter(r => r.status === status)
      .map(r => ({ ...r }));
  }

  getByType(type: CAPAType): CAPARecord[] {
    return Array.from(this._store.values())
      .filter(r => r.type === type)
      .map(r => ({ ...r }));
  }

  getByPriority(priority: CAPAPriority): CAPARecord[] {
    return Array.from(this._store.values())
      .filter(r => r.priority === priority)
      .map(r => ({ ...r }));
  }

  getByAssignee(assignedTo: string): CAPARecord[] {
    return Array.from(this._store.values())
      .filter(r => r.assignedTo === assignedTo)
      .map(r => ({ ...r }));
  }

  getOverdue(asOf: string): CAPARecord[] {
    return Array.from(this._store.values())
      .filter(r =>
        r.status !== 'CLOSED' &&
        r.status !== 'CANCELLED' &&
        r.targetDate !== undefined &&
        r.targetDate < asOf,
      )
      .map(r => ({ ...r }));
  }

  getCritical(): CAPARecord[] {
    return Array.from(this._store.values())
      .filter(r => r.priority === 'CRITICAL')
      .map(r => ({ ...r }));
  }

  getEffectiveness(): { effective: number; partiallyEffective: number; notEffective: number; total: number } {
    const closed = Array.from(this._store.values()).filter(
      r => r.status === 'CLOSED' && r.verificationResult !== undefined,
    );
    const effective = closed.filter(r => r.verificationResult === 'EFFECTIVE').length;
    const partiallyEffective = closed.filter(r => r.verificationResult === 'PARTIALLY_EFFECTIVE').length;
    const notEffective = closed.filter(r => r.verificationResult === 'NOT_EFFECTIVE').length;
    return { effective, partiallyEffective, notEffective, total: closed.length };
  }

  getCount(): number {
    return this._store.size;
  }
}
