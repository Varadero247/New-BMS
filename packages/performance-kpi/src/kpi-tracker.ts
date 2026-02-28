import { KPIDefinition, KPIMeasurement, KPIDirection, KPIStatus, KPIPeriod } from './types';

let _kpiSeq = 0;
let _measSeq = 0;

function computeStatus(def: KPIDefinition, value: number): KPIStatus {
  const { target, warningThreshold, direction } = def;
  if (direction === 'HIGHER_BETTER') {
    if (value >= target) return 'EXCEEDED';
    const ratio = value / target;
    if (ratio >= (1 - warningThreshold / 100)) return 'ON_TRACK';
    if (ratio >= (1 - warningThreshold / 50)) return 'AT_RISK';
    return 'OFF_TRACK';
  } else if (direction === 'LOWER_BETTER') {
    if (value <= target) return 'ON_TRACK';
    const ratio = value / target;
    if (ratio <= (1 + warningThreshold / 100)) return 'AT_RISK';
    return 'OFF_TRACK';
  } else { // TARGET
    const deviation = Math.abs(value - target) / target * 100;
    if (deviation <= warningThreshold / 2) return 'ON_TRACK';
    if (deviation <= warningThreshold) return 'AT_RISK';
    return 'OFF_TRACK';
  }
}

export class KPITracker {
  private readonly kpis = new Map<string, KPIDefinition>();
  private readonly measurements = new Map<string, KPIMeasurement[]>();

  define(name: string, description: string, unit: string, direction: KPIDirection, target: number, warningThreshold: number, category: string, owner: string, period: KPIPeriod): KPIDefinition {
    const id = `kpi-${++_kpiSeq}`;
    const def: KPIDefinition = { id, name, description, unit, direction, target, warningThreshold, category, owner, period };
    this.kpis.set(id, def);
    this.measurements.set(id, []);
    return def;
  }

  record(kpiId: string, value: number, measuredBy: string, period: string, notes?: string): KPIMeasurement {
    const def = this.kpis.get(kpiId);
    if (!def) throw new Error(`KPI not found: ${kpiId}`);
    const id = `meas-${++_measSeq}`;
    const status = computeStatus(def, value);
    const measurement: KPIMeasurement = {
      id, kpiId, value, measuredAt: new Date(), measuredBy, period, status, notes,
    };
    this.measurements.get(kpiId)!.push(measurement);
    return measurement;
  }

  getKPI(id: string): KPIDefinition | undefined { return this.kpis.get(id); }
  getAllKPIs(): KPIDefinition[] { return Array.from(this.kpis.values()); }
  getByCategory(category: string): KPIDefinition[] { return Array.from(this.kpis.values()).filter(k => k.category === category); }
  getByOwner(owner: string): KPIDefinition[] { return Array.from(this.kpis.values()).filter(k => k.owner === owner); }

  getMeasurements(kpiId: string): KPIMeasurement[] { return this.measurements.get(kpiId) ?? []; }
  getLatestMeasurement(kpiId: string): KPIMeasurement | undefined {
    const list = this.measurements.get(kpiId) ?? [];
    return list[list.length - 1];
  }
  getMeasurementsByStatus(status: KPIStatus): KPIMeasurement[] {
    const all: KPIMeasurement[] = [];
    for (const list of this.measurements.values()) all.push(...list);
    return all.filter(m => m.status === status);
  }
  getOffTrackKPIs(): KPIDefinition[] {
    const offTrackIds = new Set<string>();
    for (const [kpiId, list] of this.measurements.entries()) {
      if (list.length > 0 && list[list.length - 1].status === 'OFF_TRACK') offTrackIds.add(kpiId);
    }
    return Array.from(this.kpis.values()).filter(k => offTrackIds.has(k.id));
  }

  getAverageValue(kpiId: string): number {
    const list = this.measurements.get(kpiId) ?? [];
    if (list.length === 0) return 0;
    return list.reduce((s, m) => s + m.value, 0) / list.length;
  }

  getTrend(kpiId: string, lastN = 5): number[] {
    const list = this.measurements.get(kpiId) ?? [];
    return list.slice(-lastN).map(m => m.value);
  }

  getKPICount(): number { return this.kpis.size; }
}
