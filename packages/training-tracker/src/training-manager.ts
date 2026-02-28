// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { TrainingRecord, TrainingStatus, TrainingType, DeliveryMethod } from './types';

export class TrainingManager {
  private _records: Map<string, TrainingRecord> = new Map();
  private _seq: number = 0;

  enroll(
    employeeId: string,
    courseId: string,
    courseName: string,
    type: TrainingType,
    deliveryMethod: DeliveryMethod,
    scheduledDate: string,
    passingScore: number,
    instructor?: string,
  ): TrainingRecord {
    const id = `tr-${++this._seq}`;
    const record: TrainingRecord = {
      id,
      employeeId,
      courseId,
      courseName,
      type,
      deliveryMethod,
      status: 'SCHEDULED',
      scheduledDate,
      passingScore,
      instructor,
    };
    this._records.set(id, record);
    return record;
  }

  start(id: string): TrainingRecord {
    const record = this._records.get(id);
    if (!record) throw new Error(`Training record not found: ${id}`);
    record.status = 'IN_PROGRESS';
    return record;
  }

  complete(id: string, completedDate: string, score: number, expiryDate?: string): TrainingRecord {
    const record = this._records.get(id);
    if (!record) throw new Error(`Training record not found: ${id}`);
    record.completedDate = completedDate;
    record.score = score;
    record.expiryDate = expiryDate;
    record.status = score >= record.passingScore ? 'COMPLETED' : 'FAILED';
    return record;
  }

  cancel(id: string): TrainingRecord {
    const record = this._records.get(id);
    if (!record) throw new Error(`Training record not found: ${id}`);
    record.status = 'CANCELLED';
    return record;
  }

  expire(id: string): TrainingRecord {
    const record = this._records.get(id);
    if (!record) throw new Error(`Training record not found: ${id}`);
    record.status = 'EXPIRED';
    return record;
  }

  get(id: string): TrainingRecord | undefined {
    return this._records.get(id);
  }

  getByEmployee(employeeId: string): TrainingRecord[] {
    return Array.from(this._records.values()).filter(r => r.employeeId === employeeId);
  }

  getByCourse(courseId: string): TrainingRecord[] {
    return Array.from(this._records.values()).filter(r => r.courseId === courseId);
  }

  getByStatus(status: TrainingStatus): TrainingRecord[] {
    return Array.from(this._records.values()).filter(r => r.status === status);
  }

  getByType(type: TrainingType): TrainingRecord[] {
    return Array.from(this._records.values()).filter(r => r.type === type);
  }

  getExpired(asOf: string): TrainingRecord[] {
    return Array.from(this._records.values()).filter(
      r => r.status === 'COMPLETED' && r.expiryDate !== undefined && r.expiryDate < asOf,
    );
  }

  getExpiring(asOf: string, withinDays: number): TrainingRecord[] {
    const asOfDate = new Date(asOf);
    const cutoff = new Date(asOfDate);
    cutoff.setDate(cutoff.getDate() + withinDays);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return Array.from(this._records.values()).filter(
      r =>
        r.status === 'COMPLETED' &&
        r.expiryDate !== undefined &&
        r.expiryDate >= asOf &&
        r.expiryDate <= cutoffStr,
    );
  }

  getPassRate(courseId: string): number {
    const records = this.getByCourse(courseId).filter(
      r => r.status === 'COMPLETED' || r.status === 'FAILED',
    );
    if (records.length === 0) return 0;
    const completed = records.filter(r => r.status === 'COMPLETED').length;
    return (completed / records.length) * 100;
  }

  getAverageScore(courseId: string): number {
    const records = this.getByCourse(courseId).filter(
      r => r.status === 'COMPLETED' && r.score !== undefined,
    );
    if (records.length === 0) return 0;
    const total = records.reduce((sum, r) => sum + (r.score ?? 0), 0);
    return total / records.length;
  }

  getCount(): number {
    return this._records.size;
  }
}
