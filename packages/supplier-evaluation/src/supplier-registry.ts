// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  SupplierRecord,
  SupplierStatus,
  SupplierCategory,
  PerformanceRating,
} from './types';

let _idCounter = 0;
function generateId(): string {
  _idCounter += 1;
  return `SUP-${String(_idCounter).padStart(6, '0')}`;
}

export class SupplierRegistry {
  private suppliers: Map<string, SupplierRecord> = new Map();

  register(
    name: string,
    category: SupplierCategory,
    country: string,
    contactEmail: string,
    products: string[],
    notes?: string,
  ): SupplierRecord {
    const id = generateId();
    const record: SupplierRecord = {
      id,
      name,
      status: 'PENDING_APPROVAL',
      category,
      country,
      contactEmail,
      products: [...products],
      notes,
    };
    this.suppliers.set(id, record);
    return { ...record };
  }

  approve(id: string, approvedBy: string, approvedAt: string, reviewDate?: string): SupplierRecord {
    const record = this.suppliers.get(id);
    if (!record) throw new Error(`Supplier ${id} not found`);
    record.status = 'APPROVED';
    record.approvedBy = approvedBy;
    record.approvedAt = approvedAt;
    if (reviewDate !== undefined) record.reviewDate = reviewDate;
    return { ...record };
  }

  makeConditional(id: string): SupplierRecord {
    const record = this.suppliers.get(id);
    if (!record) throw new Error(`Supplier ${id} not found`);
    record.status = 'CONDITIONAL';
    return { ...record };
  }

  suspend(id: string): SupplierRecord {
    const record = this.suppliers.get(id);
    if (!record) throw new Error(`Supplier ${id} not found`);
    record.status = 'SUSPENDED';
    return { ...record };
  }

  disqualify(id: string): SupplierRecord {
    const record = this.suppliers.get(id);
    if (!record) throw new Error(`Supplier ${id} not found`);
    record.status = 'DISQUALIFIED';
    return { ...record };
  }

  updateRating(id: string, rating: PerformanceRating): SupplierRecord {
    const record = this.suppliers.get(id);
    if (!record) throw new Error(`Supplier ${id} not found`);
    record.overallRating = rating;
    return { ...record };
  }

  get(id: string): SupplierRecord | undefined {
    const record = this.suppliers.get(id);
    return record ? { ...record } : undefined;
  }

  getAll(): SupplierRecord[] {
    return Array.from(this.suppliers.values()).map((r) => ({ ...r }));
  }

  getByStatus(status: SupplierStatus): SupplierRecord[] {
    return Array.from(this.suppliers.values())
      .filter((r) => r.status === status)
      .map((r) => ({ ...r }));
  }

  getByCategory(category: SupplierCategory): SupplierRecord[] {
    return Array.from(this.suppliers.values())
      .filter((r) => r.category === category)
      .map((r) => ({ ...r }));
  }

  getByCountry(country: string): SupplierRecord[] {
    return Array.from(this.suppliers.values())
      .filter((r) => r.country === country)
      .map((r) => ({ ...r }));
  }

  getApproved(): SupplierRecord[] {
    return this.getByStatus('APPROVED');
  }

  getHighRisk(): SupplierRecord[] {
    return Array.from(this.suppliers.values())
      .filter((r) => r.status === 'CONDITIONAL' || r.status === 'SUSPENDED')
      .map((r) => ({ ...r }));
  }

  getOverdueReview(asOf: string): SupplierRecord[] {
    return Array.from(this.suppliers.values())
      .filter(
        (r) =>
          (r.status === 'APPROVED' || r.status === 'CONDITIONAL') &&
          r.reviewDate !== undefined &&
          r.reviewDate < asOf,
      )
      .map((r) => ({ ...r }));
  }

  getCount(): number {
    return this.suppliers.size;
  }
}
