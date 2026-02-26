// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

export type RiskCategory =
  | 'health_safety'
  | 'environmental'
  | 'quality'
  | 'financial'
  | 'operational'
  | 'compliance'
  | 'reputational'
  | 'cybersecurity';

export interface RiskFeatures {
  category: RiskCategory;
  likelihood: number; // 1-5
  severity: number; // 1-5
  currentControls: number; // 0-10 effectiveness score
  timeOpen: number; // days since created
  relatedIncidents: number; // count
  relatedAudits: number; // count
  mitigationProgress: number; // 0-100%
  industryBenchmark?: number; // external risk score
  seasonalFactor?: number; // 0-2 multiplier
}

export interface RiskPrediction {
  riskId: string;
  currentScore: number; // 1-100
  predictedScore30d: number; // predicted score in 30 days
  predictedScore90d: number; // predicted score in 90 days
  trend: 'increasing' | 'stable' | 'decreasing';
  confidence: number; // 0-1
  driverFeatures: Array<{ feature: string; importance: number; value: number }>;
  recommendations: string[];
  modelVersion: string;
  computedAt: Date;
}

export interface ModelConfig {
  version: string;
  weights: Record<string, number>;
  thresholds: { low: number; medium: number; high: number; critical: number };
  features: string[];
}
