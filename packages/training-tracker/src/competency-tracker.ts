// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { CompetencyRecord, CompetencyLevel } from './types';

const LEVEL_ORDER: CompetencyLevel[] = ['NOVICE', 'DEVELOPING', 'COMPETENT', 'PROFICIENT', 'EXPERT'];

function levelIndex(level: CompetencyLevel): number {
  return LEVEL_ORDER.indexOf(level);
}

export class CompetencyTracker {
  private _records: Map<string, CompetencyRecord> = new Map();
  private _seq: number = 0;

  assess(
    employeeId: string,
    competency: string,
    level: CompetencyLevel,
    assessedBy: string,
    assessedAt: string,
    targetLevel: CompetencyLevel,
    notes?: string,
  ): CompetencyRecord {
    const id = `comp-${++this._seq}`;
    const record: CompetencyRecord = {
      id,
      employeeId,
      competency,
      level,
      assessedBy,
      assessedAt,
      targetLevel,
      notes,
    };
    this._records.set(id, record);
    return record;
  }

  update(id: string, level: CompetencyLevel, assessedBy: string, assessedAt: string, notes?: string): CompetencyRecord {
    const record = this._records.get(id);
    if (!record) throw new Error(`Competency record not found: ${id}`);
    record.level = level;
    record.assessedBy = assessedBy;
    record.assessedAt = assessedAt;
    if (notes !== undefined) record.notes = notes;
    return record;
  }

  get(id: string): CompetencyRecord | undefined {
    return this._records.get(id);
  }

  getByEmployee(employeeId: string): CompetencyRecord[] {
    return Array.from(this._records.values()).filter(r => r.employeeId === employeeId);
  }

  getByCompetency(competency: string): CompetencyRecord[] {
    return Array.from(this._records.values()).filter(r => r.competency === competency);
  }

  getByLevel(level: CompetencyLevel): CompetencyRecord[] {
    return Array.from(this._records.values()).filter(r => r.level === level);
  }

  getGaps(employeeId: string): CompetencyRecord[] {
    return this.getByEmployee(employeeId).filter(
      r => levelIndex(r.level) < levelIndex(r.targetLevel),
    );
  }

  getAtTarget(employeeId: string): CompetencyRecord[] {
    return this.getByEmployee(employeeId).filter(
      r => levelIndex(r.level) >= levelIndex(r.targetLevel),
    );
  }

  getCount(): number {
    return this._records.size;
  }
}
