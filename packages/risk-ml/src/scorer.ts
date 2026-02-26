// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type { RiskFeatures } from './types';

const CATEGORY_MULTIPLIERS: Record<string, number> = {
  health_safety: 1.3,
  environmental: 1.2,
  quality: 1.1,
  financial: 1.2,
  operational: 1.0,
  compliance: 1.25,
  reputational: 1.15,
  cybersecurity: 1.3,
};

/**
 * Computes a risk score (1–100) from the provided features using a weighted rule-based model.
 */
export function computeRiskScore(features: RiskFeatures): number {
  const likelihoodScore = (features.likelihood / 5) * 25;
  const severityScore = (features.severity / 5) * 25;

  // Controls reduce score (max 10% reduction)
  const controlsReduction = (features.currentControls / 10) * 10;

  // Time open (cap at 365 days for scoring)
  const timeScore = Math.min(features.timeOpen / 365, 1) * 10;

  // Incidents and audits each add up to 5 points
  const incidentScore = Math.min(features.relatedIncidents * 2, 10);
  const auditScore = Math.min(features.relatedAudits * 1, 5);

  // Mitigation progress reduces score (max 10% reduction)
  const mitigationReduction = (features.mitigationProgress / 100) * 10;

  const base =
    likelihoodScore +
    severityScore +
    timeScore +
    incidentScore +
    auditScore -
    controlsReduction -
    mitigationReduction;

  const categoryMult = CATEGORY_MULTIPLIERS[features.category] ?? 1.0;
  const seasonal = features.seasonalFactor ?? 1.0;
  const benchmark = features.industryBenchmark ?? 0;

  const raw = base * categoryMult * seasonal + benchmark * 0.05;

  return Math.max(1, Math.min(100, Math.round(raw)));
}

/**
 * Predicts trend from a time-series of score snapshots.
 * Requires at least 2 data points.
 */
export function predictTrend(
  history: Array<{ score: number; date: Date }>
): 'increasing' | 'stable' | 'decreasing' {
  if (history.length < 2) return 'stable';

  const sorted = [...history].sort((a, b) => a.date.getTime() - b.date.getTime());
  const first = sorted[0].score;
  const last = sorted[sorted.length - 1].score;
  const delta = last - first;

  if (delta > 5) return 'increasing';
  if (delta < -5) return 'decreasing';
  return 'stable';
}

/**
 * Projects a future score from current score and trend over `days` days.
 */
export function getFutureScore(
  current: number,
  trend: string,
  days: number
): number {
  const monthFactor = days / 30;
  let delta = 0;
  if (trend === 'increasing') delta = monthFactor * 5;
  else if (trend === 'decreasing') delta = monthFactor * -5;

  return Math.max(1, Math.min(100, Math.round(current + delta)));
}

/**
 * Returns feature importance drivers for explanability.
 */
export function getDriverFeatures(
  features: RiskFeatures,
  score: number
): Array<{ feature: string; importance: number; value: number }> {
  const drivers = [
    { feature: 'likelihood', importance: 0.25, value: features.likelihood },
    { feature: 'severity', importance: 0.25, value: features.severity },
    { feature: 'currentControls', importance: 0.1, value: features.currentControls },
    { feature: 'timeOpen', importance: 0.1, value: features.timeOpen },
    { feature: 'relatedIncidents', importance: 0.1, value: features.relatedIncidents },
    { feature: 'mitigationProgress', importance: 0.1, value: features.mitigationProgress },
    { feature: 'relatedAudits', importance: 0.05, value: features.relatedAudits },
  ];

  // Scale importance by contribution to final score
  return drivers.map((d) => ({
    ...d,
    importance: parseFloat((d.importance * (score / 100)).toFixed(3)),
  }));
}

/**
 * Generates textual recommendations based on features and computed score.
 */
export function getRecommendations(features: RiskFeatures, score: number): string[] {
  const recs: string[] = [];

  if (features.currentControls < 5) {
    recs.push('Improve existing controls to reduce risk exposure');
  }
  if (features.mitigationProgress < 50) {
    recs.push('Accelerate mitigation activities to reduce open risk duration');
  }
  if (features.likelihood >= 4) {
    recs.push('Conduct likelihood analysis and implement preventive measures');
  }
  if (features.severity >= 4) {
    recs.push('Review severity classification and escalate to senior management');
  }
  if (features.relatedIncidents >= 3) {
    recs.push('Investigate recurring incidents for root cause patterns');
  }
  if (features.timeOpen > 180) {
    recs.push('Risk has been open for over 6 months — escalate for review');
  }
  if (score >= 75) {
    recs.push('Critical risk score — immediate action required');
  } else if (score >= 50) {
    recs.push('High risk score — schedule management review within 2 weeks');
  } else if (score >= 25) {
    recs.push('Medium risk — monitor closely and update mitigation plan');
  } else {
    recs.push('Risk is under control — continue monitoring');
  }

  return recs;
}
