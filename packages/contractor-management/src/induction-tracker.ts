// Copyright (c) 2026 Nexara DMCC. All rights reserved. Confidential and proprietary.

let _idCounter = 0;
function generateId(): string {
  return `ind-${Date.now()}-${++_idCounter}-${Math.random().toString(36).slice(2, 9)}`;
}
import { InductionRecord, InductionStatus, InductionType } from './types';

export class InductionTracker {
  private store: Map<string, InductionRecord> = new Map();

  create(contractorId: string, type: InductionType): InductionRecord {
    const record: InductionRecord = {
      id: generateId(),
      contractorId,
      type,
      status: 'NOT_STARTED',
    };
    this.store.set(record.id, record);
    return { ...record };
  }

  start(id: string, conductedBy: string): InductionRecord {
    const record = this.store.get(id);
    if (!record) throw new Error(`Induction not found: ${id}`);
    record.status = 'IN_PROGRESS';
    record.conductedBy = conductedBy;
    return { ...record };
  }

  complete(
    id: string,
    conductedAt: string,
    score: number,
    passed: boolean,
    expiryDate?: string,
    notes?: string,
  ): InductionRecord {
    const record = this.store.get(id);
    if (!record) throw new Error(`Induction not found: ${id}`);
    record.status = 'COMPLETED';
    record.conductedAt = conductedAt;
    record.score = score;
    record.passed = passed;
    if (expiryDate !== undefined) record.expiryDate = expiryDate;
    if (notes !== undefined) record.notes = notes;
    return { ...record };
  }

  expire(id: string): InductionRecord {
    const record = this.store.get(id);
    if (!record) throw new Error(`Induction not found: ${id}`);
    record.status = 'EXPIRED';
    return { ...record };
  }

  waive(id: string, reason: string): InductionRecord {
    const record = this.store.get(id);
    if (!record) throw new Error(`Induction not found: ${id}`);
    record.status = 'WAIVED';
    record.notes = reason;
    return { ...record };
  }

  getByContractor(contractorId: string): InductionRecord[] {
    return Array.from(this.store.values())
      .filter((r) => r.contractorId === contractorId)
      .map((r) => ({ ...r }));
  }

  getByType(type: InductionType): InductionRecord[] {
    return Array.from(this.store.values())
      .filter((r) => r.type === type)
      .map((r) => ({ ...r }));
  }

  getByStatus(status: InductionStatus): InductionRecord[] {
    return Array.from(this.store.values())
      .filter((r) => r.status === status)
      .map((r) => ({ ...r }));
  }

  getExpired(asOf: string): InductionRecord[] {
    return Array.from(this.store.values())
      .filter(
        (r) =>
          r.status === 'COMPLETED' &&
          r.expiryDate !== undefined &&
          r.expiryDate < asOf,
      )
      .map((r) => ({ ...r }));
  }

  getPending(): InductionRecord[] {
    return Array.from(this.store.values())
      .filter((r) => r.status === 'NOT_STARTED' || r.status === 'IN_PROGRESS')
      .map((r) => ({ ...r }));
  }

  getCompletionRate(): number {
    const total = this.store.size;
    if (total === 0) return 0;
    const completed = Array.from(this.store.values()).filter(
      (r) => r.status === 'COMPLETED',
    ).length;
    return (completed / total) * 100;
  }

  getCount(): number {
    return this.store.size;
  }
}
