export type KpiDirection = 'higher_better' | 'lower_better' | 'target';
export type KpiStatus = 'on_track' | 'at_risk' | 'off_track' | 'exceeded';
export type KpiFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
export type TrendDirection = 'up' | 'down' | 'stable';

export interface KpiTarget {
  value: number;
  tolerance?: number;
}

export interface KpiDataPoint {
  timestamp: number;
  value: number;
  notes?: string;
}

export interface KpiDefinition {
  id: string;
  name: string;
  unit: string;
  direction: KpiDirection;
  target: KpiTarget;
  frequency: KpiFrequency;
}

export interface KpiResult {
  kpiId: string;
  current: number;
  target: number;
  variance: number;
  variancePct: number;
  status: KpiStatus;
  trend: TrendDirection;
  performance: number;
}

export interface KpiDashboard {
  kpis: KpiResult[];
  overall: number;
  onTrackCount: number;
  atRiskCount: number;
  offTrackCount: number;
}
