export type IncidentSeverity = 'P1' | 'P2' | 'P3' | 'P4';
export type SLAStatus = 'WITHIN' | 'AT_RISK' | 'BREACHED';

export interface SLADefinition {
  severity: IncidentSeverity;
  responseTimeMinutes: number;
  resolutionTimeMinutes: number;
}

export interface IncidentSLA {
  incidentId: string;
  severity: IncidentSeverity;
  openedAt: Date;
  respondedAt?: Date;
  resolvedAt?: Date;
  responseStatus: SLAStatus;
  resolutionStatus: SLAStatus;
}

const DEFAULT_SLAS: SLADefinition[] = [
  { severity: 'P1', responseTimeMinutes: 15, resolutionTimeMinutes: 240 },
  { severity: 'P2', responseTimeMinutes: 60, resolutionTimeMinutes: 480 },
  { severity: 'P3', responseTimeMinutes: 240, resolutionTimeMinutes: 1440 },
  { severity: 'P4', responseTimeMinutes: 480, resolutionTimeMinutes: 4320 },
];

export class SLATracker {
  private readonly incidents = new Map<string, IncidentSLA>();
  private readonly slas: Map<IncidentSeverity, SLADefinition>;

  constructor(customSLAs?: SLADefinition[]) {
    this.slas = new Map((customSLAs ?? DEFAULT_SLAS).map(s => [s.severity, s]));
  }

  open(incidentId: string, severity: IncidentSeverity, openedAt = new Date()): IncidentSLA {
    const record: IncidentSLA = {
      incidentId, severity, openedAt,
      responseStatus: 'WITHIN', resolutionStatus: 'WITHIN',
    };
    this.incidents.set(incidentId, record);
    return record;
  }

  respond(incidentId: string, respondedAt = new Date()): IncidentSLA {
    const r = this.incidents.get(incidentId);
    if (!r) throw new Error(`Incident not found: ${incidentId}`);
    const sla = this.slas.get(r.severity)!;
    const elapsed = (respondedAt.getTime() - r.openedAt.getTime()) / 60000;
    const responseStatus: SLAStatus = elapsed <= sla.responseTimeMinutes ? 'WITHIN' : 'BREACHED';
    const updated = { ...r, respondedAt, responseStatus };
    this.incidents.set(incidentId, updated);
    return updated;
  }

  resolve(incidentId: string, resolvedAt = new Date()): IncidentSLA {
    const r = this.incidents.get(incidentId);
    if (!r) throw new Error(`Incident not found: ${incidentId}`);
    const sla = this.slas.get(r.severity)!;
    const elapsed = (resolvedAt.getTime() - r.openedAt.getTime()) / 60000;
    const resolutionStatus: SLAStatus = elapsed <= sla.resolutionTimeMinutes ? 'WITHIN' : 'BREACHED';
    const updated = { ...r, resolvedAt, resolutionStatus };
    this.incidents.set(incidentId, updated);
    return updated;
  }

  getStatus(incidentId: string, asOf = new Date()): { response: SLAStatus; resolution: SLAStatus } {
    const r = this.incidents.get(incidentId);
    if (!r) return { response: 'BREACHED', resolution: 'BREACHED' };
    const sla = this.slas.get(r.severity)!;
    const elapsed = (asOf.getTime() - r.openedAt.getTime()) / 60000;
    const response = r.respondedAt ? r.responseStatus
      : elapsed > sla.responseTimeMinutes ? 'BREACHED'
      : elapsed > sla.responseTimeMinutes * 0.8 ? 'AT_RISK'
      : 'WITHIN';
    const resolution = r.resolvedAt ? r.resolutionStatus
      : elapsed > sla.resolutionTimeMinutes ? 'BREACHED'
      : elapsed > sla.resolutionTimeMinutes * 0.8 ? 'AT_RISK'
      : 'WITHIN';
    return { response, resolution };
  }

  get(id: string): IncidentSLA | undefined { return this.incidents.get(id); }
  getAll(): IncidentSLA[] { return Array.from(this.incidents.values()); }
  getSLADef(severity: IncidentSeverity): SLADefinition | undefined { return this.slas.get(severity); }
  getBreached(): IncidentSLA[] { return Array.from(this.incidents.values()).filter(r => r.responseStatus === 'BREACHED' || r.resolutionStatus === 'BREACHED'); }
  getCount(): number { return this.incidents.size; }
}
