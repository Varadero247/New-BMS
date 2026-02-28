export type EmissionType = 'CO2' | 'CH4' | 'N2O' | 'HFC' | 'NOX' | 'SOX' | 'PM10' | 'VOC';
export type WasteCategory = 'HAZARDOUS' | 'NON_HAZARDOUS' | 'RECYCLABLE' | 'ORGANIC' | 'ELECTRONIC';
export type DisposalMethod = 'LANDFILL' | 'INCINERATION' | 'RECYCLING' | 'COMPOSTING' | 'TREATMENT';
export type MeasurementUnit = 'KG' | 'TONNE' | 'LITRE' | 'M3' | 'KWH' | 'MJ' | 'PPM' | 'MG_M3';
export type ComplianceStatus = 'COMPLIANT' | 'NEAR_LIMIT' | 'EXCEEDED' | 'NOT_MONITORED';
export type MonitoringFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

export interface EmissionRecord {
  id: string;
  type: EmissionType;
  amount: number;
  unit: MeasurementUnit;
  source: string;
  measuredAt: string;
  measuredBy: string;
  notes?: string;
}

export interface WasteRecord {
  id: string;
  category: WasteCategory;
  disposalMethod: DisposalMethod;
  amount: number;
  unit: MeasurementUnit;
  generatedAt: string;
  disposedAt?: string;
  contractor?: string;
  notes?: string;
}

export interface MonitoringParameter {
  id: string;
  name: string;
  unit: MeasurementUnit;
  legalLimit?: number;
  targetLimit?: number;
  frequency: MonitoringFrequency;
  location: string;
}

export interface ParameterReading {
  id: string;
  parameterId: string;
  value: number;
  measuredAt: string;
  measuredBy: string;
  complianceStatus: ComplianceStatus;
  notes?: string;
}
