// Copyright (c) 2026 Nexara DMCC. All rights reserved. Confidential.

import {
  ComplaintRecord,
  ComplaintSource,
  ComplaintSeverity,
  ComplaintStatus,
  ComplaintCategory,
} from './types';

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export class ComplaintRegister {
  private records: Map<string, ComplaintRecord> = new Map();
  private counter: number = 0;

  private nextRef(receivedAt: string): string {
    this.counter += 1;
    const year = new Date(receivedAt).getFullYear();
    const seq = String(this.counter).padStart(3, '0');
    return `CMP-${year}-${seq}`;
  }

  receive(
    source: ComplaintSource,
    severity: ComplaintSeverity,
    category: ComplaintCategory,
    customerId: string,
    customerName: string,
    description: string,
    receivedAt: string,
    targetResolutionDate?: string,
    notes?: string,
  ): ComplaintRecord {
    const id = generateId();
    const referenceNumber = this.nextRef(receivedAt);
    const record: ComplaintRecord = {
      id,
      referenceNumber,
      source,
      severity,
      status: 'RECEIVED',
      category,
      customerId,
      customerName,
      description,
      receivedAt,
      targetResolutionDate,
      notes,
    };
    this.records.set(id, record);
    return record;
  }

  acknowledge(id: string, acknowledgedAt: string): ComplaintRecord {
    const record = this.records.get(id);
    if (!record) throw new Error(`Complaint not found: ${id}`);
    record.status = 'ACKNOWLEDGED';
    record.acknowledgedAt = acknowledgedAt;
    return record;
  }

  investigate(id: string, assignedTo: string): ComplaintRecord {
    const record = this.records.get(id);
    if (!record) throw new Error(`Complaint not found: ${id}`);
    record.status = 'UNDER_INVESTIGATION';
    record.assignedTo = assignedTo;
    return record;
  }

  resolve(id: string, rootCause: string, resolvedAt: string): ComplaintRecord {
    const record = this.records.get(id);
    if (!record) throw new Error(`Complaint not found: ${id}`);
    record.status = 'RESOLVED';
    record.rootCause = rootCause;
    record.resolvedAt = resolvedAt;
    return record;
  }

  close(id: string, closedAt: string): ComplaintRecord {
    const record = this.records.get(id);
    if (!record) throw new Error(`Complaint not found: ${id}`);
    record.status = 'CLOSED';
    record.closedAt = closedAt;
    return record;
  }

  escalate(id: string): ComplaintRecord {
    const record = this.records.get(id);
    if (!record) throw new Error(`Complaint not found: ${id}`);
    record.status = 'ESCALATED';
    return record;
  }

  withdraw(id: string): ComplaintRecord {
    const record = this.records.get(id);
    if (!record) throw new Error(`Complaint not found: ${id}`);
    record.status = 'WITHDRAWN';
    return record;
  }

  get(id: string): ComplaintRecord | undefined {
    return this.records.get(id);
  }

  getAll(): ComplaintRecord[] {
    return Array.from(this.records.values());
  }

  getByStatus(status: ComplaintStatus): ComplaintRecord[] {
    return Array.from(this.records.values()).filter(r => r.status === status);
  }

  getBySeverity(severity: ComplaintSeverity): ComplaintRecord[] {
    return Array.from(this.records.values()).filter(r => r.severity === severity);
  }

  getByCategory(category: ComplaintCategory): ComplaintRecord[] {
    return Array.from(this.records.values()).filter(r => r.category === category);
  }

  getByCustomer(customerId: string): ComplaintRecord[] {
    return Array.from(this.records.values()).filter(r => r.customerId === customerId);
  }

  getOverdue(asOf: string): ComplaintRecord[] {
    const openStatuses: ComplaintStatus[] = ['RECEIVED', 'ACKNOWLEDGED', 'UNDER_INVESTIGATION'];
    return Array.from(this.records.values()).filter(r =>
      openStatuses.includes(r.status) &&
      r.targetResolutionDate !== undefined &&
      r.targetResolutionDate < asOf,
    );
  }

  getCritical(): ComplaintRecord[] {
    return Array.from(this.records.values()).filter(r => r.severity === 'CRITICAL');
  }

  getOpenCount(): number {
    const closedOrWithdrawn: ComplaintStatus[] = ['CLOSED', 'WITHDRAWN'];
    return Array.from(this.records.values()).filter(r => !closedOrWithdrawn.includes(r.status)).length;
  }

  getCount(): number {
    return this.records.size;
  }
}
