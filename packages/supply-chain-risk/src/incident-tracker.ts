import { SupplyChainIncident, IncidentType, RiskLevel } from './types';

let _incSeq = 0;

export class SupplyChainIncidentTracker {
  private readonly incidents = new Map<string, SupplyChainIncident>();

  report(vendorId: string, type: IncidentType, severity: RiskLevel, description: string, impactScore: number): SupplyChainIncident {
    const id = `sci-${++_incSeq}`;
    const incident: SupplyChainIncident = {
      id, vendorId, type, severity, description,
      reportedAt: new Date(),
      impactScore: Math.max(0, Math.min(10, impactScore)),
    };
    this.incidents.set(id, incident);
    return incident;
  }

  resolve(id: string): SupplyChainIncident {
    const inc = this.incidents.get(id);
    if (!inc) throw new Error(`Incident not found: ${id}`);
    const updated = { ...inc, resolvedAt: new Date() };
    this.incidents.set(id, updated);
    return updated;
  }

  get(id: string): SupplyChainIncident | undefined { return this.incidents.get(id); }
  getAll(): SupplyChainIncident[] { return Array.from(this.incidents.values()); }
  getByVendor(vendorId: string): SupplyChainIncident[] { return Array.from(this.incidents.values()).filter(i => i.vendorId === vendorId); }
  getByType(type: IncidentType): SupplyChainIncident[] { return Array.from(this.incidents.values()).filter(i => i.type === type); }
  getBySeverity(severity: RiskLevel): SupplyChainIncident[] { return Array.from(this.incidents.values()).filter(i => i.severity === severity); }
  getOpen(): SupplyChainIncident[] { return Array.from(this.incidents.values()).filter(i => !i.resolvedAt); }
  getResolved(): SupplyChainIncident[] { return Array.from(this.incidents.values()).filter(i => !!i.resolvedAt); }
  getCount(): number { return this.incidents.size; }
  getAverageImpact(): number {
    const all = Array.from(this.incidents.values());
    if (all.length === 0) return 0;
    return Math.round((all.reduce((s, i) => s + i.impactScore, 0) / all.length) * 10) / 10;
  }
}
