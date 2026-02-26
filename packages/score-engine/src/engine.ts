import { AggregationMethod, AssessmentScore, ScoreCriteria, ScoreConfig, ScoreGrade, ScoreInput, ScoreLevel, ScoreResult, ScoreThresholds } from './types';

export const DEFAULT_THRESHOLDS: ScoreThresholds = {
  excellent: 90,
  good: 75,
  acceptable: 60,
  poor: 40,
};

export function normalise(raw: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(1, raw / max));
}

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

export function gradeFromScore(score: number, thresholds = DEFAULT_THRESHOLDS): ScoreGrade {
  const s = clampScore(score);
  if (s >= thresholds.excellent) return 'A';
  if (s >= thresholds.good) return 'B';
  if (s >= thresholds.acceptable) return 'C';
  if (s >= thresholds.poor) return 'D';
  return 'F';
}

export function levelFromScore(score: number, thresholds = DEFAULT_THRESHOLDS): ScoreLevel {
  const s = clampScore(score);
  if (s >= thresholds.excellent) return 'excellent';
  if (s >= thresholds.good) return 'good';
  if (s >= thresholds.acceptable) return 'acceptable';
  if (s >= thresholds.poor) return 'poor';
  return 'critical';
}

export function computeScoreResult(input: ScoreInput, criteria: ScoreCriteria): ScoreResult {
  const norm = normalise(input.rawScore, criteria.maxScore);
  return {
    criteriaId: criteria.id,
    rawScore: input.rawScore,
    normalised: norm,
    weighted: norm * (criteria.weight / 100),
  };
}

export function aggregateWeightedAverage(results: ScoreResult[], criteria: ScoreCriteria[]): number {
  if (results.length === 0) return 0;
  const totalWeight = criteria.filter(c => results.some(r => r.criteriaId === c.id)).reduce((s, c) => s + c.weight, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = results.reduce((s, r) => {
    const c = criteria.find(cr => cr.id === r.criteriaId);
    return s + r.normalised * (c ? c.weight : 0);
  }, 0);
  return clampScore((weightedSum / totalWeight) * 100);
}

export function aggregateSum(results: ScoreResult[]): number {
  return clampScore(results.reduce((s, r) => s + r.weighted * 100, 0));
}

export function aggregateMin(results: ScoreResult[]): number {
  if (results.length === 0) return 0;
  return clampScore(Math.min(...results.map(r => r.normalised * 100)));
}

export function aggregateMax(results: ScoreResult[]): number {
  if (results.length === 0) return 0;
  return clampScore(Math.max(...results.map(r => r.normalised * 100)));
}

export function aggregateGeometricMean(results: ScoreResult[]): number {
  if (results.length === 0) return 0;
  const product = results.reduce((p, r) => p * Math.max(0.001, r.normalised), 1);
  return clampScore(Math.pow(product, 1 / results.length) * 100);
}

export function aggregate(results: ScoreResult[], criteria: ScoreCriteria[], method: AggregationMethod): number {
  switch (method) {
    case 'weighted_average': return aggregateWeightedAverage(results, criteria);
    case 'sum': return aggregateSum(results);
    case 'min': return aggregateMin(results);
    case 'max': return aggregateMax(results);
    case 'geometric_mean': return aggregateGeometricMean(results);
    default: return 0;
  }
}

export function computeAssessment(
  id: string, name: string,
  criteria: ScoreCriteria[], inputs: ScoreInput[],
  config: ScoreConfig
): AssessmentScore {
  const results: ScoreResult[] = [];
  for (const input of inputs) {
    const crit = criteria.find(c => c.id === input.criteriaId);
    if (crit) results.push(computeScoreResult(input, crit));
  }
  const totalScore = aggregate(results, criteria, config.aggregationMethod);
  const maxPossible = 100;
  const completeness = criteria.length > 0 ? results.length / criteria.length : 0;
  return {
    id, name, criteria, inputs, results, totalScore,
    grade: gradeFromScore(totalScore, config.thresholds),
    level: levelFromScore(totalScore, config.thresholds),
    maxPossible, completeness,
  };
}

export function isValidGrade(g: string): g is ScoreGrade {
  return ['A', 'B', 'C', 'D', 'F'].includes(g);
}

export function isValidLevel(l: string): l is ScoreLevel {
  return ['excellent', 'good', 'acceptable', 'poor', 'critical'].includes(l);
}

export function isValidAggregation(m: string): m is AggregationMethod {
  return ['weighted_average', 'sum', 'min', 'max', 'geometric_mean'].includes(m);
}

export function makeCriteria(id: string, name: string, weight: number, maxScore: number): ScoreCriteria {
  return { id, name, weight, maxScore };
}

export function makeInput(criteriaId: string, rawScore: number): ScoreInput {
  return { criteriaId, rawScore };
}

export function makeConfig(method: AggregationMethod = 'weighted_average', thresholds = DEFAULT_THRESHOLDS): ScoreConfig {
  return { aggregationMethod: method, thresholds };
}

export function totalCriteriaWeight(criteria: ScoreCriteria[]): number {
  return criteria.reduce((s, c) => s + c.weight, 0);
}
