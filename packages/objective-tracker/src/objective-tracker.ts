// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { Objective, ObjectiveStatus, Priority, StandardReference } from './types';

let objectiveCounter = 0;

function generateId(): string {
  return `obj-${++objectiveCounter}-${Date.now()}`;
}

export class ObjectiveManager {
  private objectives: Map<string, Objective> = new Map();

  create(data: Omit<Objective, 'id' | 'status'>): Objective {
    const id = generateId();
    const objective: Objective = {
      ...data,
      id,
      status: 'DRAFT',
    };
    this.objectives.set(id, objective);
    return { ...objective };
  }

  activate(id: string): Objective {
    const obj = this.objectives.get(id);
    if (!obj) throw new Error(`Objective not found: ${id}`);
    obj.status = 'ACTIVE';
    return { ...obj };
  }

  achieve(id: string, achievedDate: string): Objective {
    const obj = this.objectives.get(id);
    if (!obj) throw new Error(`Objective not found: ${id}`);
    obj.status = 'ACHIEVED';
    obj.achievedDate = achievedDate;
    return { ...obj };
  }

  markNotAchieved(id: string): Objective {
    const obj = this.objectives.get(id);
    if (!obj) throw new Error(`Objective not found: ${id}`);
    obj.status = 'NOT_ACHIEVED';
    return { ...obj };
  }

  cancel(id: string): Objective {
    const obj = this.objectives.get(id);
    if (!obj) throw new Error(`Objective not found: ${id}`);
    obj.status = 'CANCELLED';
    return { ...obj };
  }

  update(id: string, updates: Partial<Omit<Objective, 'id'>>): Objective {
    const obj = this.objectives.get(id);
    if (!obj) throw new Error(`Objective not found: ${id}`);
    Object.assign(obj, updates);
    return { ...obj };
  }

  get(id: string): Objective {
    const obj = this.objectives.get(id);
    if (!obj) throw new Error(`Objective not found: ${id}`);
    return { ...obj };
  }

  getAll(): Objective[] {
    return Array.from(this.objectives.values()).map(o => ({ ...o }));
  }

  getByStatus(status: ObjectiveStatus): Objective[] {
    return this.getAll().filter(o => o.status === status);
  }

  getByPriority(priority: Priority): Objective[] {
    return this.getAll().filter(o => o.priority === priority);
  }

  getByOwner(owner: string): Objective[] {
    return this.getAll().filter(o => o.owner === owner);
  }

  getByDepartment(dept: string): Objective[] {
    return this.getAll().filter(o => o.department === dept);
  }

  getByStandard(standard: StandardReference): Objective[] {
    return this.getAll().filter(o => o.standardReference === standard);
  }

  getOverdue(asOf: string): Objective[] {
    return this.getAll().filter(o => o.status === 'ACTIVE' && o.targetDate < asOf);
  }

  getCount(): number {
    return this.objectives.size;
  }
}
