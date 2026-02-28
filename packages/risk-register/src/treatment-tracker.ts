// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { RiskTreatment, TreatmentStatus, TreatmentType } from './types';

let treatmentCounter = 0;
function generateId(): string {
  return `trmt-${++treatmentCounter}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export class TreatmentTracker {
  private treatments: Map<string, RiskTreatment> = new Map();

  add(
    riskId: string,
    type: TreatmentType,
    description: string,
    assignedTo: string,
    dueDate: string,
    cost?: number,
    notes?: string,
  ): RiskTreatment {
    const id = generateId();
    const treatment: RiskTreatment = {
      id,
      riskId,
      type,
      description,
      status: 'PLANNED',
      assignedTo,
      dueDate,
      cost,
      notes,
    };
    this.treatments.set(id, treatment);
    return { ...treatment };
  }

  start(id: string): RiskTreatment {
    const treatment = this.treatments.get(id);
    if (!treatment) throw new Error(`Treatment not found: ${id}`);
    const updated: RiskTreatment = { ...treatment, status: 'IN_PROGRESS' };
    this.treatments.set(id, updated);
    return { ...updated };
  }

  complete(id: string, completedDate: string): RiskTreatment {
    const treatment = this.treatments.get(id);
    if (!treatment) throw new Error(`Treatment not found: ${id}`);
    const updated: RiskTreatment = { ...treatment, status: 'COMPLETED', completedDate };
    this.treatments.set(id, updated);
    return { ...updated };
  }

  cancel(id: string): RiskTreatment {
    const treatment = this.treatments.get(id);
    if (!treatment) throw new Error(`Treatment not found: ${id}`);
    const updated: RiskTreatment = { ...treatment, status: 'CANCELLED' };
    this.treatments.set(id, updated);
    return { ...updated };
  }

  getByRisk(riskId: string): RiskTreatment[] {
    return Array.from(this.treatments.values())
      .filter((t) => t.riskId === riskId)
      .map((t) => ({ ...t }));
  }

  getByType(type: TreatmentType): RiskTreatment[] {
    return Array.from(this.treatments.values())
      .filter((t) => t.type === type)
      .map((t) => ({ ...t }));
  }

  getByStatus(status: TreatmentStatus): RiskTreatment[] {
    return Array.from(this.treatments.values())
      .filter((t) => t.status === status)
      .map((t) => ({ ...t }));
  }

  getByAssignee(assignee: string): RiskTreatment[] {
    return Array.from(this.treatments.values())
      .filter((t) => t.assignedTo === assignee)
      .map((t) => ({ ...t }));
  }

  getOverdue(asOf: string): RiskTreatment[] {
    return Array.from(this.treatments.values())
      .filter(
        (t) =>
          (t.status === 'PLANNED' || t.status === 'IN_PROGRESS') &&
          t.dueDate < asOf,
      )
      .map((t) => ({ ...t }));
  }

  getTotalCost(): number {
    let total = 0;
    for (const t of this.treatments.values()) {
      if (t.cost !== undefined) total += t.cost;
    }
    return total;
  }

  getCompletionRate(): number {
    const total = this.treatments.size;
    if (total === 0) return 0;
    let completed = 0;
    for (const t of this.treatments.values()) {
      if (t.status === 'COMPLETED') completed++;
    }
    return (completed / total) * 100;
  }

  getCount(): number {
    return this.treatments.size;
  }
}
