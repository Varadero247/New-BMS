// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  StakeholderRecord,
  StakeholderType,
  InfluenceLevel,
  InterestLevel,
  EngagementStrategy,
} from './types';

export class StakeholderRegistry {
  private _store: Map<string, StakeholderRecord> = new Map();
  private _seq = 0;

  register(
    stakeholder: Omit<StakeholderRecord, 'isActive'>,
  ): StakeholderRecord {
    const record: StakeholderRecord = { ...stakeholder, isActive: true };
    this._store.set(record.id, record);
    return { ...record };
  }

  deactivate(id: string): StakeholderRecord {
    const record = this._store.get(id);
    if (!record) throw new Error(`Stakeholder not found: ${id}`);
    const updated = { ...record, isActive: false };
    this._store.set(id, updated);
    return { ...updated };
  }

  reactivate(id: string): StakeholderRecord {
    const record = this._store.get(id);
    if (!record) throw new Error(`Stakeholder not found: ${id}`);
    const updated = { ...record, isActive: true };
    this._store.set(id, updated);
    return { ...updated };
  }

  update(
    id: string,
    updates: Partial<Omit<StakeholderRecord, 'id'>>,
  ): StakeholderRecord {
    const record = this._store.get(id);
    if (!record) throw new Error(`Stakeholder not found: ${id}`);
    const updated = { ...record, ...updates };
    this._store.set(id, updated);
    return { ...updated };
  }

  get(id: string): StakeholderRecord | undefined {
    const record = this._store.get(id);
    return record ? { ...record } : undefined;
  }

  getAll(): StakeholderRecord[] {
    return Array.from(this._store.values()).map((r) => ({ ...r }));
  }

  getActive(): StakeholderRecord[] {
    return this.getAll().filter((r) => r.isActive);
  }

  getByType(type: StakeholderType): StakeholderRecord[] {
    return this.getAll().filter((r) => r.type === type);
  }

  getByStrategy(strategy: EngagementStrategy): StakeholderRecord[] {
    return this.getAll().filter((r) => r.engagementStrategy === strategy);
  }

  getByInfluence(level: InfluenceLevel): StakeholderRecord[] {
    return this.getAll().filter((r) => r.influence === level);
  }

  getByInterest(level: InterestLevel): StakeholderRecord[] {
    return this.getAll().filter((r) => r.interest === level);
  }

  getHighPriority(): StakeholderRecord[] {
    return this.getAll().filter(
      (r) => r.engagementStrategy === 'MANAGE_CLOSELY',
    );
  }

  getCount(): number {
    return this._store.size;
  }

  /** Generate a unique id for convenience in tests */
  nextId(): string {
    return `sh-${++this._seq}`;
  }
}
