// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type { ModelConfig, RiskFeatures, RiskPrediction } from './types';
import {
  computeRiskScore,
  predictTrend,
  getFutureScore,
  getDriverFeatures,
  getRecommendations,
} from './scorer';

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  version: '1.0.0',
  weights: {
    likelihood: 0.25,
    severity: 0.25,
    currentControls: 0.10,
    timeOpen: 0.10,
    relatedIncidents: 0.10,
    relatedAudits: 0.05,
    mitigationProgress: 0.10,
    industryBenchmark: 0.05,
  },
  thresholds: { low: 25, medium: 50, high: 75, critical: 90 },
  features: [
    'likelihood', 'severity', 'currentControls', 'timeOpen',
    'relatedIncidents', 'relatedAudits', 'mitigationProgress',
    'industryBenchmark', 'seasonalFactor',
  ],
};

export function validateModelConfig(
  config: Partial<ModelConfig>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.version) errors.push('Model version is required');
  if (!config.weights || Object.keys(config.weights).length === 0) {
    errors.push('Model weights are required');
  } else {
    const total = Object.values(config.weights).reduce((s, w) => s + w, 0);
    if (Math.abs(total - 1.0) > 0.001) {
      errors.push(`Weights must sum to 1.0, got ${total.toFixed(4)}`);
    }
  }
  if (!config.thresholds) {
    errors.push('Model thresholds are required');
  } else {
    const { low, medium, high, critical } = config.thresholds;
    if (low === undefined || medium === undefined || high === undefined || critical === undefined) {
      errors.push('All threshold levels (low, medium, high, critical) are required');
    } else if (!(low < medium && medium < high && high < critical)) {
      errors.push('Thresholds must be in ascending order: low < medium < high < critical');
    }
  }
  if (!Array.isArray(config.features) || config.features.length === 0) {
    errors.push('Model features list is required');
  }

  return { valid: errors.length === 0, errors };
}

export function createModel(config?: Partial<ModelConfig>): {
  predict: (riskId: string, features: RiskFeatures) => RiskPrediction;
  getConfig: () => ModelConfig;
} {
  const modelConfig: ModelConfig = {
    ...DEFAULT_MODEL_CONFIG,
    ...config,
    weights: { ...DEFAULT_MODEL_CONFIG.weights, ...(config?.weights ?? {}) },
    thresholds: { ...DEFAULT_MODEL_CONFIG.thresholds, ...(config?.thresholds ?? {}) },
  };

  function predict(riskId: string, features: RiskFeatures): RiskPrediction {
    const currentScore = computeRiskScore(features);
    const trend = predictTrend([
      { score: currentScore, date: new Date(Date.now() - 86400000 * 30) },
      { score: currentScore, date: new Date() },
    ]);
    const predictedScore30d = getFutureScore(currentScore, trend, 30);
    const predictedScore90d = getFutureScore(currentScore, trend, 90);
    const driverFeatures = getDriverFeatures(features, currentScore);
    const recommendations = getRecommendations(features, currentScore);

    // Confidence is higher when mitigation data is available
    const confidence = parseFloat(
      (0.5 + (features.mitigationProgress / 100) * 0.3 + Math.min(features.relatedAudits * 0.05, 0.2)).toFixed(2)
    );

    return {
      riskId,
      currentScore,
      predictedScore30d,
      predictedScore90d,
      trend,
      confidence: Math.min(1, confidence),
      driverFeatures,
      recommendations,
      modelVersion: modelConfig.version,
      computedAt: new Date(),
    };
  }

  return { predict, getConfig: () => modelConfig };
}
