// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { AuditRecord, AuditType, AuditStatus, AuditScope } from './types';

let counter = 0;

function generateId(): string {
  return `AUD-${Date.now()}-${++counter}`;
}

export class AuditPlanner {
  private audits: Map<string, AuditRecord> = new Map();

  plan(
    type: AuditType,
    scope: AuditScope[],
    title: string,
    leadAuditor: string,
    auditee: string,
    plannedStartDate: string,
    plannedEndDate: string,
    standardsReferenced: string[],
    objectives: string[],
    auditTeam: string[] = []
  ): AuditRecord {
    if (!title || title.trim() === '') {
      throw new Error('Audit title is required');
    }
    if (!leadAuditor || leadAuditor.trim() === '') {
      throw new Error('Lead auditor is required');
    }
    if (!auditee || auditee.trim() === '') {
      throw new Error('Auditee is required');
    }
    if (!plannedStartDate || !plannedEndDate) {
      throw new Error('Planned dates are required');
    }
    if (scope.length === 0) {
      throw new Error('At least one scope is required');
    }
    if (objectives.length === 0) {
      throw new Error('At least one objective is required');
    }

    const record: AuditRecord = {
      id: generateId(),
      type,
      scope: [...scope],
      title: title.trim(),
      status: 'PLANNED',
      leadAuditor: leadAuditor.trim(),
      auditTeam: [...auditTeam],
      auditee: auditee.trim(),
      plannedStartDate,
      plannedEndDate,
      standardsReferenced: [...standardsReferenced],
      objectives: [...objectives],
    };

    this.audits.set(record.id, record);
    return record;
  }

  start(id: string, actualStartDate: string): AuditRecord {
    const record = this.audits.get(id);
    if (!record) {
      throw new Error(`Audit not found: ${id}`);
    }
    if (record.status !== 'PLANNED' && record.status !== 'POSTPONED') {
      throw new Error(`Cannot start audit with status: ${record.status}`);
    }
    record.status = 'IN_PROGRESS';
    record.actualStartDate = actualStartDate;
    return record;
  }

  complete(id: string, actualEndDate: string): AuditRecord {
    const record = this.audits.get(id);
    if (!record) {
      throw new Error(`Audit not found: ${id}`);
    }
    if (record.status !== 'IN_PROGRESS') {
      throw new Error(`Cannot complete audit with status: ${record.status}`);
    }
    record.status = 'COMPLETED';
    record.actualEndDate = actualEndDate;
    return record;
  }

  cancel(id: string): AuditRecord {
    const record = this.audits.get(id);
    if (!record) {
      throw new Error(`Audit not found: ${id}`);
    }
    if (record.status === 'COMPLETED' || record.status === 'CANCELLED') {
      throw new Error(`Cannot cancel audit with status: ${record.status}`);
    }
    record.status = 'CANCELLED';
    return record;
  }

  postpone(id: string, newStartDate: string, newEndDate: string): AuditRecord {
    const record = this.audits.get(id);
    if (!record) {
      throw new Error(`Audit not found: ${id}`);
    }
    if (record.status !== 'PLANNED') {
      throw new Error(`Cannot postpone audit with status: ${record.status}`);
    }
    record.status = 'POSTPONED';
    record.plannedStartDate = newStartDate;
    record.plannedEndDate = newEndDate;
    return record;
  }

  addAuditor(id: string, auditorId: string): AuditRecord {
    const record = this.audits.get(id);
    if (!record) {
      throw new Error(`Audit not found: ${id}`);
    }
    if (!auditorId || auditorId.trim() === '') {
      throw new Error('Auditor ID is required');
    }
    record.auditTeam.push(auditorId.trim());
    return record;
  }

  get(id: string): AuditRecord | undefined {
    return this.audits.get(id);
  }

  getAll(): AuditRecord[] {
    return Array.from(this.audits.values());
  }

  getByType(type: AuditType): AuditRecord[] {
    return this.getAll().filter(a => a.type === type);
  }

  getByStatus(status: AuditStatus): AuditRecord[] {
    return this.getAll().filter(a => a.status === status);
  }

  getByAuditee(auditee: string): AuditRecord[] {
    return this.getAll().filter(a => a.auditee === auditee);
  }

  getByLeadAuditor(auditor: string): AuditRecord[] {
    return this.getAll().filter(a => a.leadAuditor === auditor);
  }

  getByScope(scope: AuditScope): AuditRecord[] {
    return this.getAll().filter(a => a.scope.includes(scope));
  }

  getOverdue(asOf: string): AuditRecord[] {
    return this.getAll().filter(
      a =>
        (a.status === 'PLANNED' || a.status === 'IN_PROGRESS') &&
        a.plannedEndDate < asOf
    );
  }

  getCount(): number {
    return this.audits.size;
  }
}
