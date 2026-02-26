export type AnomalyMethod = 'zscore' | 'iqr' | 'mad' | 'ewma' | 'threshold';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface DataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface AnomalyConfig {
  method: AnomalyMethod;
  threshold?: number;
  windowSize?: number;
  zScoreThreshold?: number;  // default 3.0
  iqrMultiplier?: number;    // default 1.5
  ewmaAlpha?: number;        // default 0.3
}

export interface AnomalyResult {
  point: DataPoint;
  isAnomaly: boolean;
  score: number;
  severity: Severity | null;
  method: AnomalyMethod;
}

export interface DetectionReport {
  results: AnomalyResult[];
  anomalyCount: number;
  anomalyRate: number;
  method: AnomalyMethod;
}
