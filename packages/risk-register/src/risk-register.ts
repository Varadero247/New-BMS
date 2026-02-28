// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

let riskCounter = 0;
function generateId(): string {
  return `risk-${++riskCounter}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

import {
  RiskCategory,
  RiskLevel,
  RiskRecord,
  RiskStatus,
  Impact,
  Likelihood,
} from './types';

export function computeRiskLevel(score: number): RiskLevel {
  if (score <= 4) return 'LOW';
  if (score <= 9) return 'MEDIUM';
  if (score <= 14) return 'HIGH';
  return 'CRITICAL';
}

export class RiskRegister {
  private risks: Map<string, RiskRecord> = new Map();

  identify(
    title: string,
    description: string,
    category: RiskCategory,
    owner: string,
    department: string,
    likelihood: Likelihood,
    impact: Impact,
    identifiedAt: string,
    reviewDate?: string,
    notes?: string,
  ): RiskRecord {
    const id = generateId();
    const riskScore = likelihood * impact;
    const riskLevel = computeRiskLevel(riskScore);
    const record: RiskRecord = {
      id,
      title,
      description,
      category,
      status: 'IDENTIFIED',
      owner,
      department,
      likelihood,
      impact,
      riskScore,
      riskLevel,
      identifiedAt,
      reviewDate,
      notes,
    };
    this.risks.set(id, record);
    return { ...record };
  }

  assess(id: string, likelihood: Likelihood, impact: Impact): RiskRecord {
    const record = this.risks.get(id);
    if (!record) throw new Error(`Risk not found: ${id}`);
    const riskScore = likelihood * impact;
    const riskLevel = computeRiskLevel(riskScore);
    const updated: RiskRecord = {
      ...record,
      likelihood,
      impact,
      riskScore,
      riskLevel,
      status: 'ASSESSED',
    };
    this.risks.set(id, updated);
    return { ...updated };
  }

  treat(id: string): RiskRecord {
    const record = this.risks.get(id);
    if (!record) throw new Error(`Risk not found: ${id}`);
    const updated: RiskRecord = { ...record, status: 'TREATED' };
    this.risks.set(id, updated);
    return { ...updated };
  }

  accept(id: string): RiskRecord {
    const record = this.risks.get(id);
    if (!record) throw new Error(`Risk not found: ${id}`);
    const updated: RiskRecord = { ...record, status: 'ACCEPTED' };
    this.risks.set(id, updated);
    return { ...updated };
  }

  close(id: string): RiskRecord {
    const record = this.risks.get(id);
    if (!record) throw new Error(`Risk not found: ${id}`);
    const updated: RiskRecord = { ...record, status: 'CLOSED' };
    this.risks.set(id, updated);
    return { ...updated };
  }

  escalate(id: string): RiskRecord {
    const record = this.risks.get(id);
    if (!record) throw new Error(`Risk not found: ${id}`);
    const updated: RiskRecord = { ...record, status: 'ESCALATED' };
    this.risks.set(id, updated);
    return { ...updated };
  }

  setResidual(
    id: string,
    residualLikelihood: Likelihood,
    residualImpact: Impact,
  ): RiskRecord {
    const record = this.risks.get(id);
    if (!record) throw new Error(`Risk not found: ${id}`);
    const residualScore = residualLikelihood * residualImpact;
    const residualLevel = computeRiskLevel(residualScore);
    const updated: RiskRecord = {
      ...record,
      residualLikelihood,
      residualImpact,
      residualScore,
      residualLevel,
    };
    this.risks.set(id, updated);
    return { ...updated };
  }

  update(id: string, updates: Partial<RiskRecord>): RiskRecord {
    const record = this.risks.get(id);
    if (!record) throw new Error(`Risk not found: ${id}`);
    const merged = { ...record, ...updates };
    // Recalculate score/level if likelihood or impact changed
    if (updates.likelihood !== undefined || updates.impact !== undefined) {
      merged.riskScore = merged.likelihood * merged.impact;
      merged.riskLevel = computeRiskLevel(merged.riskScore);
    }
    this.risks.set(id, merged);
    return { ...merged };
  }

  get(id: string): RiskRecord | undefined {
    const r = this.risks.get(id);
    return r ? { ...r } : undefined;
  }

  getAll(): RiskRecord[] {
    return Array.from(this.risks.values()).map((r) => ({ ...r }));
  }

  getByCategory(category: RiskCategory): RiskRecord[] {
    return Array.from(this.risks.values())
      .filter((r) => r.category === category)
      .map((r) => ({ ...r }));
  }

  getByStatus(status: RiskStatus): RiskRecord[] {
    return Array.from(this.risks.values())
      .filter((r) => r.status === status)
      .map((r) => ({ ...r }));
  }

  getByOwner(owner: string): RiskRecord[] {
    return Array.from(this.risks.values())
      .filter((r) => r.owner === owner)
      .map((r) => ({ ...r }));
  }

  getByLevel(level: RiskLevel): RiskRecord[] {
    return Array.from(this.risks.values())
      .filter((r) => r.riskLevel === level)
      .map((r) => ({ ...r }));
  }

  getHighAndCritical(): RiskRecord[] {
    return Array.from(this.risks.values())
      .filter((r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL')
      .map((r) => ({ ...r }));
  }

  getOverdueReview(asOf: string): RiskRecord[] {
    return Array.from(this.risks.values())
      .filter((r) => r.reviewDate !== undefined && r.reviewDate < asOf)
      .map((r) => ({ ...r }));
  }

  getRiskMatrix(): { low: number; medium: number; high: number; critical: number } {
    let low = 0, medium = 0, high = 0, critical = 0;
    for (const r of this.risks.values()) {
      if (r.riskLevel === 'LOW') low++;
      else if (r.riskLevel === 'MEDIUM') medium++;
      else if (r.riskLevel === 'HIGH') high++;
      else critical++;
    }
    return { low, medium, high, critical };
  }

  getCount(): number {
    return this.risks.size;
  }
}
