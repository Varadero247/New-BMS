// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  DefectRecord,
  DefectSeverity,
  DefectStatus,
} from './types';

export class DefectTracker {
  private _store: Map<string, DefectRecord> = new Map();
  private _seq: number = 0;

  report(
    inspectionId: string,
    severity: DefectSeverity,
    description: string,
    detectedBy: string,
    detectedAt: string,
    location?: string,
  ): DefectRecord {
    const id = `def-${++this._seq}`;
    const record: DefectRecord = {
      id,
      inspectionId,
      severity,
      status: 'OPEN',
      description,
      detectedBy,
      detectedAt,
      ...(location !== undefined ? { location } : {}),
    };
    this._store.set(id, record);
    return record;
  }

  review(id: string): DefectRecord {
    const record = this._store.get(id);
    if (!record) throw new Error(`Defect not found: ${id}`);
    record.status = 'UNDER_REVIEW';
    return record;
  }

  resolve(id: string, resolvedAt: string, resolution: string): DefectRecord {
    const record = this._store.get(id);
    if (!record) throw new Error(`Defect not found: ${id}`);
    record.status = 'RESOLVED';
    record.resolvedAt = resolvedAt;
    record.resolution = resolution;
    return record;
  }

  accept(id: string): DefectRecord {
    const record = this._store.get(id);
    if (!record) throw new Error(`Defect not found: ${id}`);
    record.status = 'ACCEPTED';
    return record;
  }

  reject(id: string): DefectRecord {
    const record = this._store.get(id);
    if (!record) throw new Error(`Defect not found: ${id}`);
    record.status = 'REJECTED';
    return record;
  }

  getByInspection(inspectionId: string): DefectRecord[] {
    return Array.from(this._store.values()).filter(r => r.inspectionId === inspectionId);
  }

  getBySeverity(severity: DefectSeverity): DefectRecord[] {
    return Array.from(this._store.values()).filter(r => r.severity === severity);
  }

  getByStatus(status: DefectStatus): DefectRecord[] {
    return Array.from(this._store.values()).filter(r => r.status === status);
  }

  getOpen(): DefectRecord[] {
    return Array.from(this._store.values()).filter(r => r.status === 'OPEN');
  }

  getCritical(): DefectRecord[] {
    return Array.from(this._store.values()).filter(r => r.severity === 'CRITICAL');
  }

  getCount(): number {
    return this._store.size;
  }
}
