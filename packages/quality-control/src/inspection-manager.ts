// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  InspectionRecord,
  InspectionStatus,
  InspectionType,
} from './types';

export class InspectionManager {
  private _store: Map<string, InspectionRecord> = new Map();
  private _seq: number = 0;

  schedule(
    type: InspectionType,
    productId: string,
    inspector: string,
    scheduledDate: string,
    sampleSize: number,
    batchId?: string,
  ): InspectionRecord {
    const id = `insp-${++this._seq}`;
    const record: InspectionRecord = {
      id,
      type,
      status: 'PENDING',
      productId,
      inspector,
      scheduledDate,
      sampleSize,
      defectsFound: 0,
      ...(batchId !== undefined ? { batchId } : {}),
    };
    this._store.set(id, record);
    return record;
  }

  start(id: string): InspectionRecord {
    const record = this._store.get(id);
    if (!record) throw new Error(`Inspection not found: ${id}`);
    record.status = 'IN_PROGRESS';
    return record;
  }

  complete(
    id: string,
    completedDate: string,
    defectsFound: number,
    notes?: string,
  ): InspectionRecord {
    const record = this._store.get(id);
    if (!record) throw new Error(`Inspection not found: ${id}`);
    record.completedDate = completedDate;
    record.defectsFound = defectsFound;
    if (notes !== undefined) record.notes = notes;

    if (defectsFound === 0) {
      record.status = 'PASSED';
    } else if (defectsFound > record.sampleSize * 0.05) {
      record.status = 'FAILED';
    } else {
      record.status = 'CONDITIONALLY_PASSED';
    }
    return record;
  }

  get(id: string): InspectionRecord | undefined {
    return this._store.get(id);
  }

  getAll(): InspectionRecord[] {
    return Array.from(this._store.values());
  }

  getByStatus(status: InspectionStatus): InspectionRecord[] {
    return Array.from(this._store.values()).filter(r => r.status === status);
  }

  getByType(type: InspectionType): InspectionRecord[] {
    return Array.from(this._store.values()).filter(r => r.type === type);
  }

  getByProduct(productId: string): InspectionRecord[] {
    return Array.from(this._store.values()).filter(r => r.productId === productId);
  }

  getPassRate(): number {
    const completed = Array.from(this._store.values()).filter(
      r => r.status === 'PASSED' || r.status === 'FAILED' || r.status === 'CONDITIONALLY_PASSED',
    );
    if (completed.length === 0) return 0;
    const passed = completed.filter(r => r.status === 'PASSED').length;
    return (passed / completed.length) * 100;
  }

  getDefectRate(): number {
    const completed = Array.from(this._store.values()).filter(
      r => r.status === 'PASSED' || r.status === 'FAILED' || r.status === 'CONDITIONALLY_PASSED',
    );
    if (completed.length === 0) return 0;
    const totalSample = completed.reduce((sum, r) => sum + r.sampleSize, 0);
    if (totalSample === 0) return 0;
    const totalDefects = completed.reduce((sum, r) => sum + r.defectsFound, 0);
    return (totalDefects / totalSample) * 100;
  }

  getCount(): number {
    return this._store.size;
  }
}
