import { WasteRecord, WasteCategory, DisposalMethod, MeasurementUnit } from './types';

export class WasteTracker {
  private _records: Map<string, WasteRecord> = new Map();
  private _seq = 0;

  record(
    category: WasteCategory,
    disposalMethod: DisposalMethod,
    amount: number,
    unit: MeasurementUnit,
    generatedAt: string,
    contractor?: string,
    notes?: string,
  ): WasteRecord {
    const id = `ws-${++this._seq}`;
    const rec: WasteRecord = {
      id,
      category,
      disposalMethod,
      amount,
      unit,
      generatedAt,
      ...(contractor !== undefined ? { contractor } : {}),
      ...(notes !== undefined ? { notes } : {}),
    };
    this._records.set(id, rec);
    return rec;
  }

  dispose(id: string, disposedAt: string, contractor?: string): WasteRecord {
    const rec = this._records.get(id);
    if (!rec) {
      throw new Error(`WasteRecord not found: ${id}`);
    }
    const updated: WasteRecord = {
      ...rec,
      disposedAt,
      ...(contractor !== undefined ? { contractor } : {}),
    };
    this._records.set(id, updated);
    return updated;
  }

  get(id: string): WasteRecord | undefined {
    return this._records.get(id);
  }

  getAll(): WasteRecord[] {
    return Array.from(this._records.values());
  }

  getByCategory(category: WasteCategory): WasteRecord[] {
    return Array.from(this._records.values()).filter((r) => r.category === category);
  }

  getByMethod(method: DisposalMethod): WasteRecord[] {
    return Array.from(this._records.values()).filter((r) => r.disposalMethod === method);
  }

  getPendingDisposal(): WasteRecord[] {
    return Array.from(this._records.values()).filter((r) => !r.disposedAt);
  }

  getTotalByCategory(category: WasteCategory): number {
    return this.getByCategory(category).reduce((sum, r) => sum + r.amount, 0);
  }

  getCount(): number {
    return this._records.size;
  }
}
