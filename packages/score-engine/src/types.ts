export type ScoreGrade = 'A' | 'B' | 'C' | 'D' | 'F';
export type ScoreLevel = 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical';
export type AggregationMethod = 'weighted_average' | 'sum' | 'min' | 'max' | 'geometric_mean';

export interface ScoreCriteria {
  id: string;
  name: string;
  weight: number;       // 0-100
  maxScore: number;
  description?: string;
}

export interface ScoreInput {
  criteriaId: string;
  rawScore: number;     // actual score given
  notes?: string;
}

export interface ScoreResult {
  criteriaId: string;
  rawScore: number;
  normalised: number;   // 0-1
  weighted: number;     // normalised * weight
}

export interface AssessmentScore {
  id: string;
  name: string;
  criteria: ScoreCriteria[];
  inputs: ScoreInput[];
  results: ScoreResult[];
  totalScore: number;       // 0-100
  grade: ScoreGrade;
  level: ScoreLevel;
  maxPossible: number;
  completeness: number;     // 0-1 (fraction of criteria answered)
}

export interface ScoreThresholds {
  excellent: number;    // >= this → excellent
  good: number;
  acceptable: number;
  poor: number;
  // < poor → critical
}

export interface ScoreConfig {
  thresholds: ScoreThresholds;
  aggregationMethod: AggregationMethod;
}
