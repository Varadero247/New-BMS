// Copyright (c) 2026 Nexara DMCC. All rights reserved. CONFIDENTIAL — TRADE SECRET.
import type { RcaInput, RcaResult, RcaMethod, WhyChain, FishboneCategory, CauseCategory, Severity } from './types';

export const CAUSE_CATEGORIES: CauseCategory[] = [
  'human', 'process', 'equipment', 'environment', 'material', 'management',
];

export const SEVERITY_WEIGHTS: Record<Severity, number> = {
  low: 0.25,
  medium: 0.5,
  high: 0.75,
  critical: 1.0,
};

export function getSeverityWeight(severity: Severity): number {
  return SEVERITY_WEIGHTS[severity] ?? 0.5;
}

export function buildWhyChain(rootStatement: string, depth = 5): WhyChain[] {
  const causes = [
    'Procedure not followed',
    'Inadequate training',
    'Insufficient supervision',
    'Resource constraints',
    'Management system gap',
  ];
  return Array.from({ length: Math.min(depth, 5) }, (_, i) => ({
    level: i + 1,
    statement: i === 0 ? rootStatement : causes[i - 1],
    cause: causes[i] ?? 'Root cause identified',
  }));
}

export function buildFishbone(categories: CauseCategory[] = CAUSE_CATEGORIES): FishboneCategory[] {
  const defaultCauses: Record<CauseCategory, string[]> = {
    human: ['Operator error', 'Fatigue', 'Lack of training'],
    process: ['Incorrect procedure', 'Missing checklist', 'Communication gap'],
    equipment: ['Calibration failure', 'Wear and tear', 'Incorrect tool'],
    environment: ['Temperature variation', 'Noise distraction', 'Lighting inadequate'],
    material: ['Wrong material supplied', 'Contamination', 'Specification mismatch'],
    management: ['Inadequate oversight', 'Resource allocation', 'Policy gap'],
  };
  return categories.map((cat) => ({ category: cat, causes: defaultCauses[cat] ?? [] }));
}

export function scoreRcaConfidence(
  input: RcaInput,
  suggestedCauses: string[]
): number {
  let score = 0.5;
  if (input.description.length > 100) score += 0.1;
  if (input.tags && input.tags.length > 2) score += 0.1;
  if (suggestedCauses.length >= 3) score += 0.15;
  score += getSeverityWeight(input.severity) * 0.15;
  return Math.min(1, Math.round(score * 100) / 100);
}

export function generateCorrectiveActions(rootCause: string, method: RcaMethod): string[] {
  const base = [
    `Address immediate risk related to: ${rootCause}`,
    `Retrain affected personnel on relevant procedures`,
    `Update relevant procedure or work instruction`,
  ];
  if (method === 'five-whys') base.push('Verify fix eliminates the root cause through Why Chain validation');
  if (method === 'fishbone') base.push('Address all contributing category causes identified in diagram');
  return base;
}

export function generatePreventiveActions(method: RcaMethod, severity: Severity): string[] {
  const actions = [
    'Update risk register with new failure mode',
    'Schedule periodic review of affected process',
    'Add to compliance calendar for monitoring',
  ];
  if (severity === 'critical' || severity === 'high') {
    actions.push('Escalate to management review agenda');
    actions.push('Conduct cross-site sharing of lessons learned');
  }
  return actions;
}

export function runFiveWhysAnalysis(input: RcaInput): RcaResult {
  const chain = buildWhyChain(input.description, 5);
  const rootCause = chain[chain.length - 1].cause;
  const contributingFactors = chain.slice(0, -1).map((c) => c.cause);
  const confidence = scoreRcaConfidence(input, contributingFactors);

  return {
    incidentId: input.incidentId,
    method: 'five-whys',
    rootCause,
    contributingFactors,
    correctiveActions: generateCorrectiveActions(rootCause, 'five-whys'),
    preventiveActions: generatePreventiveActions('five-whys', input.severity),
    confidence,
    generatedAt: new Date(),
  };
}

export function runFishboneAnalysis(input: RcaInput, categories?: CauseCategory[]): RcaResult {
  const fishbone = buildFishbone(categories);
  const contributingFactors = fishbone.flatMap((f) => f.causes.slice(0, 1));
  const rootCause = `Multi-causal: ${fishbone[0].category} factor most significant`;
  const confidence = scoreRcaConfidence(input, contributingFactors);

  return {
    incidentId: input.incidentId,
    method: 'fishbone',
    rootCause,
    contributingFactors,
    correctiveActions: generateCorrectiveActions(rootCause, 'fishbone'),
    preventiveActions: generatePreventiveActions('fishbone', input.severity),
    confidence,
    generatedAt: new Date(),
  };
}

export function validateRcaInput(input: Partial<RcaInput>): string[] {
  const errors: string[] = [];
  if (!input.incidentId) errors.push('incidentId is required');
  if (!input.title) errors.push('title is required');
  if (!input.description) errors.push('description is required');
  if (!input.severity || !['low', 'medium', 'high', 'critical'].includes(input.severity)) {
    errors.push('severity must be low|medium|high|critical');
  }
  if (!input.module) errors.push('module is required');
  return errors;
}

export function isValidMethod(method: string): method is RcaMethod {
  return ['five-whys', 'fishbone', 'fault-tree', 'bow-tie', 'scat'].includes(method);
}
