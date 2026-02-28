import { MaintenanceRecord, MaintenanceType } from './types';

export class MaintenanceScheduler {
  private _store = new Map<string, MaintenanceRecord>();
  private _seq = 0;

  schedule(
    assetId: string,
    type: MaintenanceType,
    scheduledDate: string,
    description: string,
    technician?: string,
  ): MaintenanceRecord {
    const id = `maint-${++this._seq}`;
    const record: MaintenanceRecord = {
      id,
      assetId,
      type,
      scheduledDate,
      description,
      ...(technician !== undefined ? { technician } : {}),
    };
    this._store.set(id, record);
    return { ...record };
  }

  complete(id: string, completedDate: string, outcome: string, cost?: number): MaintenanceRecord {
    const record = this._store.get(id);
    if (!record) throw new Error(`Maintenance record not found: ${id}`);
    record.completedDate = completedDate;
    record.outcome = outcome;
    if (cost !== undefined) record.cost = cost;
    return { ...record };
  }

  getByAsset(assetId: string): MaintenanceRecord[] {
    return Array.from(this._store.values())
      .filter((r) => r.assetId === assetId)
      .map((r) => ({ ...r }));
  }

  getByType(type: MaintenanceType): MaintenanceRecord[] {
    return Array.from(this._store.values())
      .filter((r) => r.type === type)
      .map((r) => ({ ...r }));
  }

  getPending(): MaintenanceRecord[] {
    return Array.from(this._store.values())
      .filter((r) => !r.completedDate)
      .map((r) => ({ ...r }));
  }

  getCompleted(): MaintenanceRecord[] {
    return Array.from(this._store.values())
      .filter((r) => !!r.completedDate)
      .map((r) => ({ ...r }));
  }

  getOverdue(asOf: string): MaintenanceRecord[] {
    return Array.from(this._store.values())
      .filter((r) => !r.completedDate && r.scheduledDate < asOf)
      .map((r) => ({ ...r }));
  }

  getTotalCost(assetId: string): number {
    return Array.from(this._store.values())
      .filter((r) => r.assetId === assetId && !!r.completedDate && r.cost !== undefined)
      .reduce((sum, r) => sum + (r.cost as number), 0);
  }

  getCount(): number {
    return this._store.size;
  }
}
