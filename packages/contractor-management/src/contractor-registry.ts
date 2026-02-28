// Copyright (c) 2026 Nexara DMCC. All rights reserved. Confidential and proprietary.

let _idCounter = 0;
function generateId(): string {
  return `cr-${Date.now()}-${++_idCounter}-${Math.random().toString(36).slice(2, 9)}`;
}
import {
  ContractorRecord,
  ContractorStatus,
  ContractorType,
  ComplianceItem,
} from './types';

export class ContractorRegistry {
  private store: Map<string, ContractorRecord> = new Map();

  register(
    name: string,
    type: ContractorType,
    contactEmail: string,
    trade: string,
    riskRating: 'LOW' | 'MEDIUM' | 'HIGH',
    complianceItems: ComplianceItem[] = [],
    contactPhone?: string,
    notes?: string,
  ): ContractorRecord {
    const record: ContractorRecord = {
      id: generateId(),
      name,
      type,
      status: 'PENDING_APPROVAL',
      contactEmail,
      trade,
      riskRating,
      complianceItems: [...complianceItems],
      contactPhone,
      notes,
    };
    this.store.set(record.id, record);
    return { ...record };
  }

  approve(id: string, approvedBy: string, approvedAt: string, expiryDate?: string): ContractorRecord {
    const record = this.store.get(id);
    if (!record) throw new Error(`Contractor not found: ${id}`);
    record.status = 'APPROVED';
    record.approvedBy = approvedBy;
    record.approvedAt = approvedAt;
    if (expiryDate !== undefined) record.expiryDate = expiryDate;
    return { ...record };
  }

  suspend(id: string): ContractorRecord {
    const record = this.store.get(id);
    if (!record) throw new Error(`Contractor not found: ${id}`);
    record.status = 'SUSPENDED';
    return { ...record };
  }

  blacklist(id: string): ContractorRecord {
    const record = this.store.get(id);
    if (!record) throw new Error(`Contractor not found: ${id}`);
    record.status = 'BLACKLISTED';
    return { ...record };
  }

  expire(id: string): ContractorRecord {
    const record = this.store.get(id);
    if (!record) throw new Error(`Contractor not found: ${id}`);
    record.status = 'EXPIRED';
    return { ...record };
  }

  addComplianceItem(id: string, item: ComplianceItem): ContractorRecord {
    const record = this.store.get(id);
    if (!record) throw new Error(`Contractor not found: ${id}`);
    if (!record.complianceItems.includes(item)) {
      record.complianceItems.push(item);
    }
    return { ...record };
  }

  get(id: string): ContractorRecord | undefined {
    const record = this.store.get(id);
    return record ? { ...record } : undefined;
  }

  getAll(): ContractorRecord[] {
    return Array.from(this.store.values()).map((r) => ({ ...r }));
  }

  getByStatus(status: ContractorStatus): ContractorRecord[] {
    return Array.from(this.store.values())
      .filter((r) => r.status === status)
      .map((r) => ({ ...r }));
  }

  getByType(type: ContractorType): ContractorRecord[] {
    return Array.from(this.store.values())
      .filter((r) => r.type === type)
      .map((r) => ({ ...r }));
  }

  getByRiskRating(rating: 'LOW' | 'MEDIUM' | 'HIGH'): ContractorRecord[] {
    return Array.from(this.store.values())
      .filter((r) => r.riskRating === rating)
      .map((r) => ({ ...r }));
  }

  getByTrade(trade: string): ContractorRecord[] {
    return Array.from(this.store.values())
      .filter((r) => r.trade === trade)
      .map((r) => ({ ...r }));
  }

  getApproved(): ContractorRecord[] {
    return this.getByStatus('APPROVED');
  }

  getExpired(asOf: string): ContractorRecord[] {
    return Array.from(this.store.values())
      .filter((r) => r.status === 'APPROVED' && r.expiryDate !== undefined && r.expiryDate < asOf)
      .map((r) => ({ ...r }));
  }

  getCount(): number {
    return this.store.size;
  }
}
