export type EnergyType = 'ELECTRICITY' | 'NATURAL_GAS' | 'DIESEL' | 'LPG' | 'STEAM' | 'COMPRESSED_AIR' | 'SOLAR' | 'WIND';
export type MeterUnit = 'KWH' | 'MWH' | 'GJ' | 'MMBTU' | 'M3' | 'LITRES' | 'KG';
export type ReadingType = 'ACTUAL' | 'ESTIMATED' | 'CALCULATED';
export type BaselineStatus = 'DRAFT' | 'APPROVED' | 'SUPERSEDED';
export type PerformanceStatus = 'IMPROVEMENT' | 'NO_CHANGE' | 'DETERIORATION';

export interface EnergyReading {
  id: string;
  meterId: string;
  energyType: EnergyType;
  value: number;
  unit: MeterUnit;
  readingType: ReadingType;
  recordedAt: string;
  recordedBy: string;
  notes?: string;
}

export interface EnergyMeterRecord {
  id: string;
  name: string;
  energyType: EnergyType;
  location: string;
  unit: MeterUnit;
  isActive: boolean;
  installDate: string;
  lastReadingDate?: string;
}

export interface EnergyBaseline {
  id: string;
  name: string;
  energyType: EnergyType;
  status: BaselineStatus;
  baselineYear: number;
  baselineValue: number;
  unit: MeterUnit;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  notes?: string;
}
