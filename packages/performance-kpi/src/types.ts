export type KPIDirection = 'HIGHER_BETTER' | 'LOWER_BETTER' | 'TARGET';
export type KPIStatus = 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' | 'EXCEEDED' | 'NOT_MEASURED';
export type KPIPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

export interface KPIDefinition {
  id: string;
  name: string;
  description: string;
  unit: string;
  direction: KPIDirection;
  target: number;
  warningThreshold: number;   // % deviation from target that triggers AT_RISK
  category: string;
  owner: string;
  period: KPIPeriod;
}

export interface KPIMeasurement {
  id: string;
  kpiId: string;
  value: number;
  measuredAt: Date;
  measuredBy: string;
  period: string;   // e.g. '2026-Q1', '2026-02'
  status: KPIStatus;
  notes?: string;
}
