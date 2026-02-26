import { Assignment, Experiment, ExperimentEvent, ExperimentResults, ExperimentStatus, MetricType, Variant, VariantStats, VariantType } from './types';

export function createVariant(id: string, name: string, type: VariantType, weight: number, config?: Record<string, unknown>): Variant {
  return { id, name, type, weight, ...(config ? { config } : {}) };
}

export function createExperiment(id: string, name: string, variants: Variant[], metrics: MetricType[]): Experiment {
  return { id, name, status: 'draft', variants, metrics, createdAt: Date.now() };
}

export function totalWeight(variants: Variant[]): number {
  return variants.reduce((s, v) => s + v.weight, 0);
}

export function normaliseWeights(variants: Variant[]): Variant[] {
  const total = totalWeight(variants);
  if (total === 0) return variants;
  return variants.map(v => ({ ...v, weight: (v.weight / total) * 100 }));
}

export function assignVariant(userId: string, experiment: Experiment): Assignment | null {
  if (experiment.status !== 'running') return null;
  if (experiment.variants.length === 0) return null;
  // Deterministic hash-based assignment
  let hash = 0;
  const key = `${userId}:${experiment.id}`;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash) + key.charCodeAt(i);
    hash = hash >>> 0;
  }
  const bucket = hash % 100;
  let cumulative = 0;
  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (bucket < cumulative) {
      return { userId, experimentId: experiment.id, variantId: variant.id, assignedAt: Date.now() };
    }
  }
  const last = experiment.variants[experiment.variants.length - 1];
  return { userId, experimentId: experiment.id, variantId: last.id, assignedAt: Date.now() };
}

export function startExperiment(exp: Experiment): Experiment {
  return { ...exp, status: 'running', startDate: Date.now() };
}

export function pauseExperiment(exp: Experiment): Experiment {
  return { ...exp, status: 'paused' };
}

export function completeExperiment(exp: Experiment): Experiment {
  return { ...exp, status: 'completed', endDate: Date.now() };
}

export function isExperimentActive(exp: Experiment): boolean {
  return exp.status === 'running';
}

export function computeVariantStats(variantId: string, events: ExperimentEvent[]): VariantStats {
  const vEvents = events.filter(e => e.variantId === variantId);
  const participants = new Set(vEvents.map(e => e.userId)).size;
  const conversions = vEvents.filter(e => e.metricType === 'conversion' && e.value > 0).length;
  const conversionRate = participants > 0 ? conversions / participants : 0;
  const revenueEvents = vEvents.filter(e => e.metricType === 'revenue');
  const totalRevenue = revenueEvents.reduce((s, e) => s + e.value, 0);
  const avgRevenue = revenueEvents.length > 0 ? totalRevenue / revenueEvents.length : 0;
  return { variantId, participants, conversions, conversionRate, totalRevenue, avgRevenue };
}

export function computeResults(experiment: Experiment, events: ExperimentEvent[]): ExperimentResults {
  const variantStats = experiment.variants.map(v => computeVariantStats(v.id, events));
  const sampleSize = variantStats.reduce((s, vs) => s + vs.participants, 0);
  const best = variantStats.reduce((a, b) => b.conversionRate > a.conversionRate ? b : a, variantStats[0]);
  const winner = best && best.conversionRate > 0 ? best.variantId : undefined;
  return { experimentId: experiment.id, variantStats, winner, sampleSize };
}

export function isValidStatus(s: string): s is ExperimentStatus {
  return ['draft', 'running', 'paused', 'completed', 'archived'].includes(s);
}

export function isValidMetric(m: string): m is MetricType {
  return ['conversion', 'revenue', 'engagement', 'retention', 'custom'].includes(m);
}

export function filterActiveExperiments(experiments: Experiment[]): Experiment[] {
  return experiments.filter(isExperimentActive);
}

export function getExperimentById(experiments: Experiment[], id: string): Experiment | undefined {
  return experiments.find(e => e.id === id);
}

export function makeEvent(userId: string, experimentId: string, variantId: string, metricType: MetricType, value: number): ExperimentEvent {
  return { userId, experimentId, variantId, metricType, value, timestamp: Date.now() };
}
