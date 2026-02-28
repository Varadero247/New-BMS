// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { ComplianceObligation, ObligationType } from './types';

export class ObligationTracker {
  private _store: Map<string, ComplianceObligation> = new Map();
  private _seq: number = 0;

  add(
    requirementId: string,
    description: string,
    obligationType: ObligationType,
    assignedTo: string,
    dueDate?: string,
    evidence?: string,
    notes?: string,
  ): ComplianceObligation {
    const id = `obl-${++this._seq}`;
    const record: ComplianceObligation = {
      id,
      requirementId,
      description,
      obligationType,
      assignedTo,
      dueDate,
      evidence,
      notes,
    };
    this._store.set(id, record);
    return { ...record };
  }

  complete(id: string, completedDate: string, evidence?: string, notes?: string): ComplianceObligation {
    const existing = this._store.get(id);
    if (!existing) throw new Error(`ComplianceObligation not found: ${id}`);
    const updated: ComplianceObligation = {
      ...existing,
      completedDate,
      ...(evidence !== undefined ? { evidence } : {}),
      ...(notes !== undefined ? { notes } : {}),
    };
    this._store.set(id, updated);
    return { ...updated };
  }

  getByRequirement(requirementId: string): ComplianceObligation[] {
    return Array.from(this._store.values())
      .filter(o => o.requirementId === requirementId)
      .map(o => ({ ...o }));
  }

  getByAssignee(assignedTo: string): ComplianceObligation[] {
    return Array.from(this._store.values())
      .filter(o => o.assignedTo === assignedTo)
      .map(o => ({ ...o }));
  }

  getByType(type: ObligationType): ComplianceObligation[] {
    return Array.from(this._store.values())
      .filter(o => o.obligationType === type)
      .map(o => ({ ...o }));
  }

  getPending(): ComplianceObligation[] {
    return Array.from(this._store.values())
      .filter(o => o.completedDate === undefined)
      .map(o => ({ ...o }));
  }

  getOverdue(asOf: string): ComplianceObligation[] {
    return this.getPending().filter(
      o => o.dueDate !== undefined && o.dueDate < asOf,
    );
  }

  getCompleted(): ComplianceObligation[] {
    return Array.from(this._store.values())
      .filter(o => o.completedDate !== undefined)
      .map(o => ({ ...o }));
  }

  getCount(): number {
    return this._store.size;
  }
}
