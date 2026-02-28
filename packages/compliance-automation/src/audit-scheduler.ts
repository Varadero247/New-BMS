import { AuditSchedule, AuditStatus, ComplianceSummary, ControlStatus } from './types';

let _seq = 0;

export class AuditScheduler {
  private readonly schedules = new Map<string, AuditSchedule>();

  schedule(
    name: string,
    framework: string,
    scheduledDate: Date,
    assignedTo: string,
    controlIds: string[],
  ): AuditSchedule {
    const id = `audit-${++_seq}-${Date.now()}`;
    const audit: AuditSchedule = {
      id, name, framework, scheduledDate, assignedTo,
      status: 'SCHEDULED', controlIds,
    };
    this.schedules.set(id, audit);
    return audit;
  }

  start(id: string): AuditSchedule {
    const a = this.schedules.get(id);
    if (!a) throw new Error(`Audit not found: ${id}`);
    const updated = { ...a, status: 'IN_PROGRESS' as AuditStatus };
    this.schedules.set(id, updated);
    return updated;
  }

  complete(id: string, notes?: string): AuditSchedule {
    const a = this.schedules.get(id);
    if (!a) throw new Error(`Audit not found: ${id}`);
    const updated = { ...a, status: 'COMPLETED' as AuditStatus, completedAt: new Date(), notes };
    this.schedules.set(id, updated);
    return updated;
  }

  cancel(id: string, notes?: string): AuditSchedule {
    const a = this.schedules.get(id);
    if (!a) throw new Error(`Audit not found: ${id}`);
    const updated = { ...a, status: 'CANCELLED' as AuditStatus, notes };
    this.schedules.set(id, updated);
    return updated;
  }

  markOverdue(asOf = new Date()): AuditSchedule[] {
    const overdue: AuditSchedule[] = [];
    for (const [id, a] of this.schedules.entries()) {
      if (a.status === 'SCHEDULED' && a.scheduledDate < asOf) {
        const updated = { ...a, status: 'OVERDUE' as AuditStatus };
        this.schedules.set(id, updated);
        overdue.push(updated);
      }
    }
    return overdue;
  }

  get(id: string): AuditSchedule | undefined {
    return this.schedules.get(id);
  }

  getAll(): AuditSchedule[] {
    return Array.from(this.schedules.values());
  }

  getByStatus(status: AuditStatus): AuditSchedule[] {
    return Array.from(this.schedules.values()).filter(a => a.status === status);
  }

  getByFramework(framework: string): AuditSchedule[] {
    return Array.from(this.schedules.values()).filter(a => a.framework === framework);
  }

  getByAssignee(assignedTo: string): AuditSchedule[] {
    return Array.from(this.schedules.values()).filter(a => a.assignedTo === assignedTo);
  }

  getCount(): number {
    return this.schedules.size;
  }

  getUpcoming(asOf = new Date(), days = 30): AuditSchedule[] {
    const cutoff = new Date(asOf.getTime() + days * 86400000);
    return Array.from(this.schedules.values()).filter(
      a => a.status === 'SCHEDULED' && a.scheduledDate >= asOf && a.scheduledDate <= cutoff,
    );
  }

  buildComplianceSummary(
    framework: string,
    testResults: Array<{ controlId: string; status: ControlStatus; score: number }>,
  ): ComplianceSummary {
    const frameworkAudits = this.getByFramework(framework);
    const controlIds = new Set(frameworkAudits.flatMap(a => a.controlIds));
    const relevant = testResults.filter(r => controlIds.has(r.controlId));
    const count = (s: ControlStatus) => relevant.filter(r => r.status === s).length;
    const totalControls = controlIds.size;
    const effective = count('EFFECTIVE');
    const partial = count('PARTIAL');
    const ineffective = count('INEFFECTIVE');
    const notTested = totalControls - relevant.length;
    const overallScore = relevant.length > 0
      ? Math.round(relevant.reduce((s, r) => s + r.score, 0) / relevant.length)
      : 0;
    return { framework, totalControls, effective, partial, ineffective, notTested, overallScore };
  }
}
