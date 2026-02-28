// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  NonconformanceRecord,
  NonconformanceType,
  DispositionType,
} from './types';

export class NonconformanceTracker {
  private _store: Map<string, NonconformanceRecord> = new Map();
  private _seq: number = 0;

  raise(
    type: NonconformanceType,
    description: string,
    disposition: DispositionType,
    raisedBy: string,
    raisedAt: string,
    quantity: number,
    unit: string,
    cost?: number,
  ): NonconformanceRecord {
    const id = `nc-${++this._seq}`;
    const record: NonconformanceRecord = {
      id,
      type,
      description,
      disposition,
      raisedBy,
      raisedAt,
      quantity,
      unit,
      ...(cost !== undefined ? { cost } : {}),
    };
    this._store.set(id, record);
    return record;
  }

  close(id: string, closedAt: string): NonconformanceRecord {
    const record = this._store.get(id);
    if (!record) throw new Error(`Nonconformance not found: ${id}`);
    record.closedAt = closedAt;
    return record;
  }

  getAll(): NonconformanceRecord[] {
    return Array.from(this._store.values());
  }

  getByType(type: NonconformanceType): NonconformanceRecord[] {
    return Array.from(this._store.values()).filter(r => r.type === type);
  }

  getByDisposition(disposition: DispositionType): NonconformanceRecord[] {
    return Array.from(this._store.values()).filter(r => r.disposition === disposition);
  }

  getOpen(): NonconformanceRecord[] {
    return Array.from(this._store.values()).filter(r => r.closedAt === undefined);
  }

  getTotalCost(): number {
    return Array.from(this._store.values()).reduce((sum, r) => sum + (r.cost ?? 0), 0);
  }

  getCount(): number {
    return this._store.size;
  }
}
