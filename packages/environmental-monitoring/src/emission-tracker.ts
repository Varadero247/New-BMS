import { EmissionRecord, EmissionType, MeasurementUnit } from './types';

export class EmissionTracker {
  private _records: Map<string, EmissionRecord> = new Map();
  private _seq = 0;

  record(
    type: EmissionType,
    amount: number,
    unit: MeasurementUnit,
    source: string,
    measuredAt: string,
    measuredBy: string,
    notes?: string,
  ): EmissionRecord {
    const id = `em-${++this._seq}`;
    const record: EmissionRecord = {
      id,
      type,
      amount,
      unit,
      source,
      measuredAt,
      measuredBy,
      ...(notes !== undefined ? { notes } : {}),
    };
    this._records.set(id, record);
    return record;
  }

  get(id: string): EmissionRecord | undefined {
    return this._records.get(id);
  }

  getAll(): EmissionRecord[] {
    return Array.from(this._records.values());
  }

  getByType(type: EmissionType): EmissionRecord[] {
    return Array.from(this._records.values()).filter((r) => r.type === type);
  }

  getBySource(source: string): EmissionRecord[] {
    return Array.from(this._records.values()).filter((r) => r.source === source);
  }

  getTotalByType(type: EmissionType): number {
    return this.getByType(type).reduce((sum, r) => sum + r.amount, 0);
  }

  getTotalAll(): number {
    return Array.from(this._records.values()).reduce((sum, r) => sum + r.amount, 0);
  }

  getByDateRange(from: string, to: string): EmissionRecord[] {
    return Array.from(this._records.values()).filter(
      (r) => r.measuredAt >= from && r.measuredAt <= to,
    );
  }

  getCount(): number {
    return this._records.size;
  }
}
