// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { IsolationRecord, IsolationType, IsolationStatus } from './types';

let _isoCounter = 0;
function generateIsoId(): string {
  _isoCounter += 1;
  return `ISO-${Date.now()}-${_isoCounter}`;
}

export class IsolationTracker {
  private isolations: Map<string, IsolationRecord> = new Map();

  apply(
    permitId: string,
    type: IsolationType,
    isolationPoint: string,
    appliedBy: string,
    appliedAt: string,
    notes?: string,
  ): IsolationRecord {
    const id = generateIsoId();
    const record: IsolationRecord = {
      id,
      permitId,
      type,
      status: 'APPLIED',
      isolationPoint,
      appliedBy,
      appliedAt,
      notes,
    };
    this.isolations.set(id, record);
    return record;
  }

  verify(id: string, verifiedBy: string, verifiedAt: string): IsolationRecord {
    const record = this.isolations.get(id);
    if (!record) throw new Error(`Isolation not found: ${id}`);
    if (record.status !== 'APPLIED') throw new Error(`Cannot verify isolation in status ${record.status}`);
    record.status = 'VERIFIED';
    record.verifiedBy = verifiedBy;
    record.verifiedAt = verifiedAt;
    return record;
  }

  remove(id: string, removedBy: string, removedAt: string): IsolationRecord {
    const record = this.isolations.get(id);
    if (!record) throw new Error(`Isolation not found: ${id}`);
    if (record.status !== 'VERIFIED') throw new Error(`Cannot remove isolation in status ${record.status}`);
    record.status = 'REMOVED';
    record.removedBy = removedBy;
    record.removedAt = removedAt;
    return record;
  }

  markFailed(id: string): IsolationRecord {
    const record = this.isolations.get(id);
    if (!record) throw new Error(`Isolation not found: ${id}`);
    record.status = 'FAILED';
    return record;
  }

  getByPermit(permitId: string): IsolationRecord[] {
    return Array.from(this.isolations.values()).filter((r) => r.permitId === permitId);
  }

  getByStatus(status: IsolationStatus): IsolationRecord[] {
    return Array.from(this.isolations.values()).filter((r) => r.status === status);
  }

  getByType(type: IsolationType): IsolationRecord[] {
    return Array.from(this.isolations.values()).filter((r) => r.type === type);
  }

  getApplied(): IsolationRecord[] {
    return this.getByStatus('APPLIED');
  }

  getUnverified(): IsolationRecord[] {
    return this.getByStatus('APPLIED');
  }

  getCount(): number {
    return this.isolations.size;
  }
}
