import {
  MonitoringParameter,
  ParameterReading,
  MeasurementUnit,
  MonitoringFrequency,
  ComplianceStatus,
} from './types';

export class ParameterMonitor {
  private _parameters: Map<string, MonitoringParameter> = new Map();
  private _readings: Map<string, ParameterReading> = new Map();
  private _paramSeq = 0;
  private _readSeq = 0;

  defineParameter(
    name: string,
    unit: MeasurementUnit,
    frequency: MonitoringFrequency,
    location: string,
    legalLimit?: number,
    targetLimit?: number,
  ): MonitoringParameter {
    const id = `param-${++this._paramSeq}`;
    const param: MonitoringParameter = {
      id,
      name,
      unit,
      frequency,
      location,
      ...(legalLimit !== undefined ? { legalLimit } : {}),
      ...(targetLimit !== undefined ? { targetLimit } : {}),
    };
    this._parameters.set(id, param);
    return param;
  }

  addReading(
    parameterId: string,
    value: number,
    measuredAt: string,
    measuredBy: string,
    notes?: string,
  ): ParameterReading {
    const param = this._parameters.get(parameterId);
    if (!param) {
      throw new Error(`MonitoringParameter not found: ${parameterId}`);
    }

    let complianceStatus: ComplianceStatus;
    if (param.legalLimit === undefined) {
      complianceStatus = 'NOT_MONITORED';
    } else if (value > param.legalLimit) {
      complianceStatus = 'EXCEEDED';
    } else if (value > param.legalLimit * 0.9) {
      complianceStatus = 'NEAR_LIMIT';
    } else {
      complianceStatus = 'COMPLIANT';
    }

    const id = `read-${++this._readSeq}`;
    const reading: ParameterReading = {
      id,
      parameterId,
      value,
      measuredAt,
      measuredBy,
      complianceStatus,
      ...(notes !== undefined ? { notes } : {}),
    };
    this._readings.set(id, reading);
    return reading;
  }

  getParameter(id: string): MonitoringParameter | undefined {
    return this._parameters.get(id);
  }

  getAllParameters(): MonitoringParameter[] {
    return Array.from(this._parameters.values());
  }

  getReadings(parameterId: string): ParameterReading[] {
    return Array.from(this._readings.values()).filter((r) => r.parameterId === parameterId);
  }

  getLatestReading(parameterId: string): ParameterReading | undefined {
    const readings = this.getReadings(parameterId);
    if (readings.length === 0) return undefined;
    return readings.reduce((latest, r) => (r.measuredAt > latest.measuredAt ? r : latest));
  }

  getByCompliance(status: ComplianceStatus): ParameterReading[] {
    return Array.from(this._readings.values()).filter((r) => r.complianceStatus === status);
  }

  getExceeded(): ParameterReading[] {
    return this.getByCompliance('EXCEEDED');
  }

  getReadingCount(): number {
    return this._readings.size;
  }
}
