// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { PermitRecord, PermitType, PermitStatus, RiskLevel } from './types';

let _idCounter = 0;
function generateId(): string {
  _idCounter += 1;
  return `PTW-${Date.now()}-${_idCounter}`;
}

export class PermitManager {
  private permits: Map<string, PermitRecord> = new Map();

  draft(
    type: PermitType,
    title: string,
    location: string,
    workDescription: string,
    riskLevel: RiskLevel,
    requestedBy: string,
    requestedAt: string,
    supervisor: string,
    hazards: string[],
    precautions: string[],
    workers: string[],
    notes?: string,
  ): PermitRecord {
    const id = generateId();
    const record: PermitRecord = {
      id,
      type,
      status: 'DRAFT',
      title,
      location,
      workDescription,
      riskLevel,
      requestedBy,
      requestedAt,
      supervisor,
      hazards: [...hazards],
      precautions: [...precautions],
      workers: [...workers],
      notes,
    };
    this.permits.set(id, record);
    return record;
  }

  submitForApproval(id: string): PermitRecord {
    const record = this.permits.get(id);
    if (!record) throw new Error(`Permit not found: ${id}`);
    if (record.status !== 'DRAFT') throw new Error(`Cannot submit permit in status ${record.status}`);
    record.status = 'PENDING_APPROVAL';
    return record;
  }

  approve(
    id: string,
    approvedBy: string,
    approvedAt: string,
    validFrom: string,
    validUntil: string,
  ): PermitRecord {
    const record = this.permits.get(id);
    if (!record) throw new Error(`Permit not found: ${id}`);
    if (record.status !== 'PENDING_APPROVAL') throw new Error(`Cannot approve permit in status ${record.status}`);
    record.status = 'APPROVED';
    record.approvedBy = approvedBy;
    record.approvedAt = approvedAt;
    record.validFrom = validFrom;
    record.validUntil = validUntil;
    return record;
  }

  activate(id: string): PermitRecord {
    const record = this.permits.get(id);
    if (!record) throw new Error(`Permit not found: ${id}`);
    if (record.status !== 'APPROVED') throw new Error(`Cannot activate permit in status ${record.status}`);
    record.status = 'ACTIVE';
    return record;
  }

  suspend(id: string): PermitRecord {
    const record = this.permits.get(id);
    if (!record) throw new Error(`Permit not found: ${id}`);
    if (record.status !== 'ACTIVE') throw new Error(`Cannot suspend permit in status ${record.status}`);
    record.status = 'SUSPENDED';
    return record;
  }

  complete(id: string, completedAt: string): PermitRecord {
    const record = this.permits.get(id);
    if (!record) throw new Error(`Permit not found: ${id}`);
    if (record.status !== 'ACTIVE') throw new Error(`Cannot complete permit in status ${record.status}`);
    record.status = 'COMPLETED';
    record.completedAt = completedAt;
    return record;
  }

  cancel(id: string, cancelledAt: string): PermitRecord {
    const record = this.permits.get(id);
    if (!record) throw new Error(`Permit not found: ${id}`);
    if (record.status === 'COMPLETED') throw new Error(`Cannot cancel a completed permit`);
    record.status = 'CANCELLED';
    record.cancelledAt = cancelledAt;
    return record;
  }

  addWorker(id: string, workerId: string): PermitRecord {
    const record = this.permits.get(id);
    if (!record) throw new Error(`Permit not found: ${id}`);
    record.workers.push(workerId);
    return record;
  }

  get(id: string): PermitRecord | undefined {
    return this.permits.get(id);
  }

  getAll(): PermitRecord[] {
    return Array.from(this.permits.values());
  }

  getByType(type: PermitType): PermitRecord[] {
    return Array.from(this.permits.values()).filter((r) => r.type === type);
  }

  getByStatus(status: PermitStatus): PermitRecord[] {
    return Array.from(this.permits.values()).filter((r) => r.status === status);
  }

  getByRiskLevel(level: RiskLevel): PermitRecord[] {
    return Array.from(this.permits.values()).filter((r) => r.riskLevel === level);
  }

  getActive(): PermitRecord[] {
    return this.getByStatus('ACTIVE');
  }

  getExpired(asOf: string): PermitRecord[] {
    return Array.from(this.permits.values()).filter(
      (r) =>
        (r.status === 'ACTIVE' || r.status === 'APPROVED') &&
        r.validUntil !== undefined &&
        r.validUntil < asOf,
    );
  }

  getByRequestor(requestedBy: string): PermitRecord[] {
    return Array.from(this.permits.values()).filter((r) => r.requestedBy === requestedBy);
  }

  getBySupervisor(supervisor: string): PermitRecord[] {
    return Array.from(this.permits.values()).filter((r) => r.supervisor === supervisor);
  }

  getCount(): number {
    return this.permits.size;
  }
}
