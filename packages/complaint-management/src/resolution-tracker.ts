// Copyright (c) 2026 Nexara DMCC. All rights reserved. Confidential.

import { ResolutionRecord, ResolutionType } from './types';

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export class ResolutionTracker {
  private records: Map<string, ResolutionRecord> = new Map();

  record(
    complaintId: string,
    type: ResolutionType,
    description: string,
    implementedBy: string,
    implementedAt: string,
    customerSatisfied?: boolean,
    satisfactionScore?: number,
    capaRaised?: boolean,
    capaId?: string,
    notes?: string,
  ): ResolutionRecord {
    const id = generateId();
    const res: ResolutionRecord = {
      id,
      complaintId,
      type,
      description,
      implementedBy,
      implementedAt,
      customerSatisfied,
      satisfactionScore,
      capaRaised,
      capaId,
      notes,
    };
    this.records.set(id, res);
    return res;
  }

  getByComplaint(complaintId: string): ResolutionRecord[] {
    return Array.from(this.records.values()).filter(r => r.complaintId === complaintId);
  }

  getByType(type: ResolutionType): ResolutionRecord[] {
    return Array.from(this.records.values()).filter(r => r.type === type);
  }

  getAverageSatisfaction(): number {
    const withScore = Array.from(this.records.values()).filter(
      r => r.satisfactionScore !== undefined,
    );
    if (withScore.length === 0) return 0;
    const sum = withScore.reduce((acc, r) => acc + (r.satisfactionScore as number), 0);
    return sum / withScore.length;
  }

  getSatisfactionRate(): number {
    const all = Array.from(this.records.values());
    if (all.length === 0) return 0;
    const satisfied = all.filter(r => r.customerSatisfied === true).length;
    return (satisfied / all.length) * 100;
  }

  getCAPALinked(): ResolutionRecord[] {
    return Array.from(this.records.values()).filter(r => r.capaRaised === true);
  }

  getCount(): number {
    return this.records.size;
  }
}
