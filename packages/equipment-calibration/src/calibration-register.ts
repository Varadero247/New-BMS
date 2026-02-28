import {
  EquipmentRecord,
  EquipmentStatus,
  EquipmentType,
  CalibrationFrequency,
} from './types';

export class CalibrationRegister {
  private records: Map<string, EquipmentRecord> = new Map();
  private seq = 0;

  private newId(): string {
    return `eq-${++this.seq}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  register(
    assetTag: string,
    name: string,
    type: EquipmentType,
    location: string,
    owner: string,
    calibrationFrequency: CalibrationFrequency,
    calibrationIntervalDays: number,
    serialNumber?: string,
    manufacturer?: string,
    model?: string,
    notes?: string,
  ): EquipmentRecord {
    const id = this.newId();
    const record: EquipmentRecord = {
      id,
      assetTag,
      name,
      type,
      status: 'ACTIVE',
      location,
      owner,
      calibrationFrequency,
      calibrationIntervalDays,
      serialNumber,
      manufacturer,
      model,
      notes,
    };
    this.records.set(id, record);
    return record;
  }

  scheduleDue(id: string): EquipmentRecord {
    const record = this.records.get(id);
    if (!record) throw new Error(`Equipment not found: ${id}`);
    record.status = 'DUE_FOR_CALIBRATION';
    return record;
  }

  startCalibration(id: string): EquipmentRecord {
    const record = this.records.get(id);
    if (!record) throw new Error(`Equipment not found: ${id}`);
    record.status = 'UNDER_CALIBRATION';
    return record;
  }

  completeCalibration(
    id: string,
    calibrationDate: string,
    nextCalibrationDate: string,
  ): EquipmentRecord {
    const record = this.records.get(id);
    if (!record) throw new Error(`Equipment not found: ${id}`);
    record.status = 'ACTIVE';
    record.lastCalibrationDate = calibrationDate;
    record.nextCalibrationDate = nextCalibrationDate;
    return record;
  }

  putOutOfService(id: string): EquipmentRecord {
    const record = this.records.get(id);
    if (!record) throw new Error(`Equipment not found: ${id}`);
    record.status = 'OUT_OF_SERVICE';
    return record;
  }

  retire(id: string): EquipmentRecord {
    const record = this.records.get(id);
    if (!record) throw new Error(`Equipment not found: ${id}`);
    record.status = 'RETIRED';
    return record;
  }

  get(id: string): EquipmentRecord | undefined {
    return this.records.get(id);
  }

  getAll(): EquipmentRecord[] {
    return Array.from(this.records.values());
  }

  getByStatus(status: EquipmentStatus): EquipmentRecord[] {
    return this.getAll().filter((r) => r.status === status);
  }

  getByType(type: EquipmentType): EquipmentRecord[] {
    return this.getAll().filter((r) => r.type === type);
  }

  getByLocation(location: string): EquipmentRecord[] {
    return this.getAll().filter((r) => r.location === location);
  }

  getByOwner(owner: string): EquipmentRecord[] {
    return this.getAll().filter((r) => r.owner === owner);
  }

  getDueForCalibration(asOf: string): EquipmentRecord[] {
    return this.getAll().filter(
      (r) =>
        (r.status === 'ACTIVE' || r.status === 'DUE_FOR_CALIBRATION') &&
        r.nextCalibrationDate !== undefined &&
        r.nextCalibrationDate <= asOf,
    );
  }

  getOverdue(asOf: string): EquipmentRecord[] {
    return this.getAll().filter(
      (r) =>
        r.status === 'ACTIVE' &&
        r.nextCalibrationDate !== undefined &&
        r.nextCalibrationDate < asOf,
    );
  }

  getCount(): number {
    return this.records.size;
  }
}
