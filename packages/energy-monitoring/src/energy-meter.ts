import {
  EnergyType,
  MeterUnit,
  ReadingType,
  EnergyMeterRecord,
  EnergyReading,
} from './types';

let _meterCounter = 0;
let _readingCounter = 0;

function generateMeterId(): string {
  _meterCounter += 1;
  return `METER-${Date.now()}-${_meterCounter}`;
}

function generateReadingId(): string {
  _readingCounter += 1;
  return `READING-${Date.now()}-${_readingCounter}`;
}

export class EnergyMeterManager {
  private meters: Map<string, EnergyMeterRecord> = new Map();
  private readings: Map<string, EnergyReading[]> = new Map();

  registerMeter(
    name: string,
    energyType: EnergyType,
    location: string,
    unit: MeterUnit,
    installDate: string,
  ): EnergyMeterRecord {
    const id = generateMeterId();
    const meter: EnergyMeterRecord = {
      id,
      name,
      energyType,
      location,
      unit,
      isActive: true,
      installDate,
    };
    this.meters.set(id, meter);
    this.readings.set(id, []);
    return meter;
  }

  decommission(meterId: string): boolean {
    const meter = this.meters.get(meterId);
    if (!meter) return false;
    meter.isActive = false;
    return true;
  }

  recordReading(
    meterId: string,
    value: number,
    readingType: ReadingType,
    recordedAt: string,
    recordedBy: string,
    notes?: string,
  ): EnergyReading | null {
    const meter = this.meters.get(meterId);
    if (!meter) return null;

    const reading: EnergyReading = {
      id: generateReadingId(),
      meterId,
      energyType: meter.energyType,
      value,
      unit: meter.unit,
      readingType,
      recordedAt,
      recordedBy,
      notes,
    };

    const meterReadings = this.readings.get(meterId) ?? [];
    meterReadings.push(reading);
    this.readings.set(meterId, meterReadings);

    // Update lastReadingDate if this reading is more recent
    if (!meter.lastReadingDate || recordedAt > meter.lastReadingDate) {
      meter.lastReadingDate = recordedAt;
    }

    return reading;
  }

  getMeter(id: string): EnergyMeterRecord | undefined {
    return this.meters.get(id);
  }

  getAllMeters(): EnergyMeterRecord[] {
    return Array.from(this.meters.values());
  }

  getActiveMeters(): EnergyMeterRecord[] {
    return Array.from(this.meters.values()).filter((m) => m.isActive);
  }

  getByEnergyType(type: EnergyType): EnergyMeterRecord[] {
    return Array.from(this.meters.values()).filter((m) => m.energyType === type);
  }

  getReadings(meterId: string): EnergyReading[] {
    return this.readings.get(meterId) ?? [];
  }

  getLatestReading(meterId: string): EnergyReading | undefined {
    const meterReadings = this.readings.get(meterId) ?? [];
    if (meterReadings.length === 0) return undefined;
    return meterReadings.reduce((latest, r) =>
      r.recordedAt > latest.recordedAt ? r : latest,
    );
  }

  getTotalConsumption(meterId: string): number {
    const meterReadings = this.readings.get(meterId) ?? [];
    return meterReadings.reduce((sum, r) => sum + r.value, 0);
  }

  getConsumptionByDateRange(
    meterId: string,
    from: string,
    to: string,
  ): EnergyReading[] {
    const meterReadings = this.readings.get(meterId) ?? [];
    return meterReadings.filter((r) => r.recordedAt >= from && r.recordedAt <= to);
  }

  getMeterCount(): number {
    return this.meters.size;
  }

  getReadingCount(): number {
    let total = 0;
    for (const arr of this.readings.values()) {
      total += arr.length;
    }
    return total;
  }
}
