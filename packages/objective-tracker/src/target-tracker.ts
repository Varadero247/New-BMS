// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { ObjectiveTarget, ProgressRecord, TargetStatus, MeasurementUnit } from './types';

let targetCounter = 0;
let progressCounter = 0;

function generateTargetId(): string {
  return `tgt-${++targetCounter}-${Date.now()}`;
}

function generateProgressId(): string {
  return `prg-${++progressCounter}-${Date.now()}`;
}

function computeStatus(
  currentValue: number,
  targetValue: number,
  dueDate: string,
  lastUpdated: string,
): TargetStatus {
  if (currentValue >= targetValue) return 'ACHIEVED';
  if (dueDate < lastUpdated && currentValue < targetValue) return 'MISSED';
  if (currentValue >= targetValue * 0.7) return 'ON_TRACK';
  return 'AT_RISK';
}

export class TargetTracker {
  private targets: Map<string, ObjectiveTarget> = new Map();
  private progressRecords: Map<string, ProgressRecord[]> = new Map();

  addTarget(
    objectiveId: string,
    description: string,
    targetValue: number,
    unit: MeasurementUnit,
    dueDate: string,
    assignedTo: string,
    lastUpdated: string,
  ): ObjectiveTarget {
    const id = generateTargetId();
    const target: ObjectiveTarget = {
      id,
      objectiveId,
      description,
      targetValue,
      currentValue: 0,
      unit,
      status: 'PENDING',
      dueDate,
      assignedTo,
      lastUpdated,
    };
    this.targets.set(id, target);
    this.progressRecords.set(id, []);
    return { ...target };
  }

  updateProgress(targetId: string, newValue: number, lastUpdated: string): ObjectiveTarget {
    const target = this.targets.get(targetId);
    if (!target) throw new Error(`Target not found: ${targetId}`);
    target.currentValue = newValue;
    target.lastUpdated = lastUpdated;
    target.status = computeStatus(newValue, target.targetValue, target.dueDate, lastUpdated);
    return { ...target };
  }

  recordProgress(
    targetId: string,
    value: number,
    recordedAt: string,
    recordedBy: string,
    notes?: string,
  ): ProgressRecord {
    const target = this.targets.get(targetId);
    if (!target) throw new Error(`Target not found: ${targetId}`);

    const record: ProgressRecord = {
      id: generateProgressId(),
      targetId,
      value,
      recordedAt,
      recordedBy,
      notes,
    };

    const records = this.progressRecords.get(targetId) ?? [];
    records.push(record);
    this.progressRecords.set(targetId, records);

    this.updateProgress(targetId, value, recordedAt);

    return { ...record };
  }

  getByObjective(objectiveId: string): ObjectiveTarget[] {
    return Array.from(this.targets.values())
      .filter(t => t.objectiveId === objectiveId)
      .map(t => ({ ...t }));
  }

  getByStatus(status: TargetStatus): ObjectiveTarget[] {
    return Array.from(this.targets.values())
      .filter(t => t.status === status)
      .map(t => ({ ...t }));
  }

  getByAssignee(assignee: string): ObjectiveTarget[] {
    return Array.from(this.targets.values())
      .filter(t => t.assignedTo === assignee)
      .map(t => ({ ...t }));
  }

  getProgressHistory(targetId: string): ProgressRecord[] {
    const target = this.targets.get(targetId);
    if (!target) throw new Error(`Target not found: ${targetId}`);
    return (this.progressRecords.get(targetId) ?? []).map(r => ({ ...r }));
  }

  getAtRisk(): ObjectiveTarget[] {
    return this.getByStatus('AT_RISK');
  }

  getMissed(): ObjectiveTarget[] {
    return this.getByStatus('MISSED');
  }

  getAchievementRate(): number {
    const total = this.targets.size;
    if (total === 0) return 0;
    const achieved = Array.from(this.targets.values()).filter(t => t.status === 'ACHIEVED').length;
    return (achieved / total) * 100;
  }

  getTargetCount(): number {
    return this.targets.size;
  }

  getProgressCount(): number {
    let count = 0;
    for (const records of this.progressRecords.values()) {
      count += records.length;
    }
    return count;
  }
}
