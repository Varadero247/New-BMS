// Copyright (c) 2026 Nexara DMCC. All rights reserved. Confidential and proprietary.

import {
  InspectionPlan,
  InspectionCategory,
  InspectionFrequency,
  InspectionStatus,
} from './types';

let _idCounter = 0;
function generateId(): string {
  _idCounter += 1;
  return `insp-${Date.now()}-${_idCounter}`;
}

export class InspectionPlanner {
  private plans: Map<string, InspectionPlan> = new Map();

  schedule(
    title: string,
    category: InspectionCategory,
    frequency: InspectionFrequency,
    location: string,
    assignedTo: string,
    scheduledDate: string,
    checklistId?: string,
    notes?: string,
  ): InspectionPlan {
    const id = generateId();
    const plan: InspectionPlan = {
      id,
      title,
      category,
      frequency,
      status: 'SCHEDULED',
      location,
      assignedTo,
      scheduledDate,
      ...(checklistId !== undefined ? { checklistId } : {}),
      ...(notes !== undefined ? { notes } : {}),
    };
    this.plans.set(id, plan);
    return plan;
  }

  start(id: string): InspectionPlan {
    const plan = this.plans.get(id);
    if (!plan) throw new Error(`Inspection not found: ${id}`);
    plan.status = 'IN_PROGRESS';
    return plan;
  }

  complete(id: string, completedDate: string, score: number, notes?: string): InspectionPlan {
    const plan = this.plans.get(id);
    if (!plan) throw new Error(`Inspection not found: ${id}`);
    plan.status = 'COMPLETED';
    plan.completedDate = completedDate;
    plan.score = score;
    if (notes !== undefined) plan.notes = notes;
    return plan;
  }

  skip(id: string, notes?: string): InspectionPlan {
    const plan = this.plans.get(id);
    if (!plan) throw new Error(`Inspection not found: ${id}`);
    plan.status = 'SKIPPED';
    if (notes !== undefined) plan.notes = notes;
    return plan;
  }

  markOverdue(id: string): InspectionPlan {
    const plan = this.plans.get(id);
    if (!plan) throw new Error(`Inspection not found: ${id}`);
    plan.status = 'OVERDUE';
    return plan;
  }

  get(id: string): InspectionPlan | undefined {
    return this.plans.get(id);
  }

  getAll(): InspectionPlan[] {
    return Array.from(this.plans.values());
  }

  getByCategory(category: InspectionCategory): InspectionPlan[] {
    return Array.from(this.plans.values()).filter((p) => p.category === category);
  }

  getByStatus(status: InspectionStatus): InspectionPlan[] {
    return Array.from(this.plans.values()).filter((p) => p.status === status);
  }

  getByAssignee(assignee: string): InspectionPlan[] {
    return Array.from(this.plans.values()).filter((p) => p.assignedTo === assignee);
  }

  getByLocation(location: string): InspectionPlan[] {
    return Array.from(this.plans.values()).filter((p) => p.location === location);
  }

  getOverdue(asOf: string): InspectionPlan[] {
    return Array.from(this.plans.values()).filter(
      (p) =>
        (p.status === 'SCHEDULED' || p.status === 'IN_PROGRESS') && p.scheduledDate < asOf,
    );
  }

  getAverageScore(): number {
    const completed = Array.from(this.plans.values()).filter(
      (p) => p.status === 'COMPLETED' && p.score !== undefined,
    );
    if (completed.length === 0) return 0;
    const total = completed.reduce((sum, p) => sum + (p.score as number), 0);
    return total / completed.length;
  }

  getCount(): number {
    return this.plans.size;
  }
}
