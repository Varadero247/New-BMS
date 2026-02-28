// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import {
  LegalRequirement,
  RequirementType,
  Jurisdiction,
  ComplianceStatus,
} from './types';

export class LegalRegister {
  private _store: Map<string, LegalRequirement> = new Map();
  private _seq: number = 0;

  add(req: Omit<LegalRequirement, 'isActive'>): LegalRequirement {
    const id = req.id || `req-${++this._seq}`;
    const record: LegalRequirement = { ...req, id, isActive: true };
    this._store.set(id, record);
    return { ...record };
  }

  update(id: string, updates: Partial<Omit<LegalRequirement, 'id'>>): LegalRequirement {
    const existing = this._store.get(id);
    if (!existing) throw new Error(`LegalRequirement not found: ${id}`);
    const updated: LegalRequirement = { ...existing, ...updates, id };
    this._store.set(id, updated);
    return { ...updated };
  }

  deactivate(id: string): LegalRequirement {
    return this.update(id, { isActive: false });
  }

  setCompliance(id: string, status: ComplianceStatus): LegalRequirement {
    return this.update(id, { complianceStatus: status });
  }

  get(id: string): LegalRequirement | undefined {
    const r = this._store.get(id);
    return r ? { ...r } : undefined;
  }

  getAll(): LegalRequirement[] {
    return Array.from(this._store.values()).map(r => ({ ...r }));
  }

  getActive(): LegalRequirement[] {
    return this.getAll().filter(r => r.isActive);
  }

  getByType(type: RequirementType): LegalRequirement[] {
    return this.getAll().filter(r => r.type === type);
  }

  getByJurisdiction(jurisdiction: Jurisdiction): LegalRequirement[] {
    return this.getAll().filter(r => r.jurisdiction === jurisdiction);
  }

  getByStatus(status: ComplianceStatus): LegalRequirement[] {
    return this.getAll().filter(r => r.complianceStatus === status);
  }

  getByOwner(owner: string): LegalRequirement[] {
    return this.getAll().filter(r => r.owner === owner);
  }

  getOverdueReview(asOf: string): LegalRequirement[] {
    return this.getActive().filter(
      r => r.nextReviewDate !== undefined && r.nextReviewDate < asOf,
    );
  }

  getNonCompliant(): LegalRequirement[] {
    return this.getAll().filter(
      r => r.complianceStatus === 'NON_COMPLIANT' || r.complianceStatus === 'PARTIAL',
    );
  }

  getExpiring(asOf: string, withinDays: number): LegalRequirement[] {
    const asOfDate = new Date(asOf);
    const cutoff = new Date(asOfDate.getTime() + withinDays * 24 * 60 * 60 * 1000);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return this.getActive().filter(
      r =>
        r.expiryDate !== undefined &&
        r.expiryDate >= asOf &&
        r.expiryDate <= cutoffStr,
    );
  }

  getCount(): number {
    return this._store.size;
  }
}
